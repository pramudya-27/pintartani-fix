import os
import logging
from dotenv import load_dotenv
from openai import OpenAI

logger = logging.getLogger(__name__)

load_dotenv()
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", os.getenv("QWEN_API_KEY"))

if DASHSCOPE_API_KEY:
    _client = OpenAI(
        api_key=DASHSCOPE_API_KEY,
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    )
else:
    _client = None
    logger.warning("DASHSCOPE_API_KEY tidak ditemukan di environment variables.")

MODEL = "deepseek-v4-flash"

def get_deepseek_fallback(komoditas: str, suhu: float, curah_hujan_mm: float, predicted_price: float, current_price: float) -> str | None:
    """
    Menggunakan DeepSeek API untuk memberikan fallback recommendation.
    """
    if not _client:
        return None

    system_instruction = "Kamu adalah pakar agronomi dan analis pasar pertanian Indonesia. Berikan rekomendasi praktis 2 kalimat singkat untuk petani tradisional. Jawablah langsung pada poin penting tanpa basa-basi untuk menghemat token."
    
    prompt = f"""
    Data Pertanian & Pasar:
    - Komoditas: {komoditas}
    - Suhu: {suhu} °C
    - Curah Hujan: {curah_hujan_mm} mm
    - Harga Saat Ini: Rp {current_price}
    - Prediksi Harga ML: Rp {predicted_price}
    
    Berikan rekomendasi apakah sebaiknya petani panen, tunda, atau mengambil tindakan mitigasi tertentu.
    """

    try:
        response = _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        text = response.choices[0].message.content
        return text.strip() if text else None
    except Exception as e:
        logger.error(f"[DeepSeek] Gagal generate content: {e}")
        return None

def ask_deepseek(prompt: str) -> str | None:
    if not _client:
        return None
    system = "Kamu adalah asisten AI pakar pertanian Indonesia (PintarTani). Jawablah dengan singkat, padat, langsung pada poin pentingnya saja tanpa basa-basi atau pernyataan yang tidak perlu agar hemat token dan mudah dipahami."
    try:
        response = _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        text = response.choices[0].message.content
        return text.strip() if text else None
    except Exception as e:
        logger.error(f"[DeepSeek] Gagal generate ask content: {e}")
        return None

def stream_ask_deepseek(prompt: str):
    if not _client:
        yield "Error: DeepSeek client not initialized."
        return
    system = "Kamu adalah asisten AI pakar pertanian Indonesia (PintarTani). Jawablah dengan singkat, padat, langsung pada poin pentingnya saja tanpa basa-basi atau pernyataan yang tidak perlu agar hemat token dan mudah dipahami."
    try:
        response = _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            stream=True
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        logger.error(f"[DeepSeek] Gagal stream content: {e}")
        yield f"Error: {str(e)}"
