import os
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from sqlalchemy.orm import Session

# Import Internal Services
from backend.ml_service import ml_service_instance
from backend.decision_engine import get_recommendation
from backend.llm_gemini import is_extreme_condition, get_gemini_fallback, ask_gemini, stream_ask_gemini
from backend.llm_deepseek import get_deepseek_fallback, ask_deepseek, stream_ask_deepseek
from backend.llm_qwen import get_qwen_fallback, ask_qwen, stream_ask_qwen
from backend.database import get_db, engine, Base
from backend.auth_router import router as auth_router, get_current_user, check_and_deduct_quota
from backend.models import User

# Create APIRouter - can be mounted to another app or run directly
router = APIRouter()

class PredictionRequest(BaseModel):
    komoditas: str = Field(..., description="Jenis komoditas: Bawang Merah, Cabai Rawit, Tomat")
    suhu_celsius: float = Field(..., description="Suhu saat ini dalam Celsius")
    curah_hujan_mm: float = Field(..., description="Curah hujan saat ini dalam mm")
    harga_sekarang: float = Field(..., description="Harga komoditas saat ini per kg")
    harga_h_1: float = Field(None, description="Harga H-1. Jika kosong akan menggunakan harga_sekarang")
    harga_h_3: float = Field(None, description="Harga H-3. Jika kosong akan menggunakan harga_sekarang")
    target_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

class PredictionResponse(BaseModel):
    predicted_price: float
    weather_context: str
    recommendation: str
    is_gemini_fallback: bool
    status: str

@router.post("/api/predict", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):
    try:
        # 1. Format Request Data
        req_data = request.dict()
        req_data['harga_h-1'] = request.harga_h_1 if request.harga_h_1 is not None else request.harga_sekarang
        req_data['harga_h-3'] = request.harga_h_3 if request.harga_h_3 is not None else request.harga_sekarang
        
        # 2. Get Machine Learning Prediction
        feature_array = ml_service_instance.format_input(req_data)
        predicted_price = ml_service_instance.predict(feature_array, request.harga_sekarang)

        weather_context = f"Suhu {request.suhu_celsius}°C, Curah Hujan {request.curah_hujan_mm}mm"
        
        # 3. Handle Fallback / Decision Engine
        if is_extreme_condition(request.curah_hujan_mm, predicted_price, request.harga_sekarang):
            # Prioritas AI Fallback: DeepSeek -> Qwen -> Gemini
            recommendation = get_deepseek_fallback(request.komoditas, request.suhu_celsius, request.curah_hujan_mm, predicted_price, request.harga_sekarang)
            if not recommendation:
                recommendation = get_qwen_fallback(request.komoditas, request.suhu_celsius, request.curah_hujan_mm, predicted_price, request.harga_sekarang)
            if not recommendation:
                recommendation = get_gemini_fallback(
                    request.komoditas, 
                    request.suhu_celsius, 
                    request.curah_hujan_mm, 
                    predicted_price, 
                    request.harga_sekarang
                )
            is_gemini = True
        else:
            # Use Standard Decision Rules
            recommendation = get_recommendation(predicted_price, request.harga_sekarang)
            is_gemini = False

        return PredictionResponse(
            predicted_price=round(predicted_price, 0),
            weather_context=weather_context,
            recommendation=recommendation,
            is_gemini_fallback=is_gemini,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AskRequest(BaseModel):
    prompt: str

class AskResponse(BaseModel):
    content: str
    data_source: str
    quota_left: int

@router.post("/api/ask", response_model=AskResponse)
def ask_ai(request: AskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        quota_left = check_and_deduct_quota(current_user, db)
        
        # Tentukan urutan model berdasarkan kuota sebelum pengurangan (Q = quota_left + 1)
        Q = quota_left + 1
        if Q == 5:
            model_chain = [("Gemini AI", ask_gemini), ("Qwen AI", ask_qwen), ("DeepSeek AI", ask_deepseek)]
        elif Q == 4 or Q == 2:
            model_chain = [("Qwen AI", ask_qwen), ("DeepSeek AI", ask_deepseek), ("Gemini AI", ask_gemini)]
        else: # Q == 3 atau Q == 1
            model_chain = [("DeepSeek AI", ask_deepseek), ("Qwen AI", ask_qwen), ("Gemini AI", ask_gemini)]

        content = None
        source = ""

        for name, ask_func in model_chain:
            try:
                content = ask_func(request.prompt)
                if content:
                    source = name
                    break
            except Exception as e:
                print(f"⚠️ Error calling {name}: {e}")
                continue

        # Final Fallback jika semua gagal
        if not content:
            content = "Maaf, semua layanan AI sedang sibuk. Silakan coba lagi nanti."
            source = "System"
                
        return AskResponse(content=content, data_source=source, quota_left=quota_left)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/ask/stream")
async def ask_ai_stream(request: AskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from fastapi.responses import StreamingResponse
    import json

    try:
        quota_left = check_and_deduct_quota(current_user, db)
        
        # Tentukan urutan model berdasarkan kuota sebelum pengurangan (Q = quota_left + 1)
        Q = quota_left + 1
        if Q == 5:
            model_chain = [("Gemini AI", stream_ask_gemini), ("Qwen AI", stream_ask_qwen), ("DeepSeek AI", stream_ask_deepseek)]
        elif Q == 4 or Q == 2:
            model_chain = [("Qwen AI", stream_ask_qwen), ("DeepSeek AI", stream_ask_deepseek), ("Gemini AI", stream_ask_gemini)]
        else: # Q == 3 atau Q == 1
            model_chain = [("DeepSeek AI", stream_ask_deepseek), ("Qwen AI", stream_ask_qwen), ("Gemini AI", stream_ask_gemini)]

        async def event_generator():
            # Kirim quota_left di awal sebagai metadata
            yield f"data: {json.dumps({'quota_left': quota_left})}\n\n"
            
            generator = None
            source = ""

            for name, stream_func in model_chain:
                try:
                    generator = stream_func(request.prompt)
                    if generator:
                        source = name
                        break
                except Exception as e:
                    print(f"⚠️ Error calling stream for {name}: {e}")
                    continue

            # Kirim source
            yield f"data: {json.dumps({'source': source})}\n\n"

            if generator:
                for chunk in generator:
                    if chunk:
                        yield f"data: {json.dumps({'content': chunk})}\n\n"
            else:
                yield f"data: {json.dumps({'content': 'Maaf, semua layanan AI sedang sibuk. Silakan coba lagi nanti.'})}\n\n"
            
            yield "data: [DONE]\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Standalone application if run directly
app = FastAPI(title="PintarTani API Web Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(auth_router)

# Auto-create tables if engine is available
if engine:
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    # To run: python -m backend.api_router
    uvicorn.run(app, host="0.0.0.0", port=8000)
