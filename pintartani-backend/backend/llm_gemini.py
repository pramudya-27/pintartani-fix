import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment logic
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set in the environment variables.")

def is_extreme_condition(curah_hujan_mm: float, predicted_price: float, current_price: float) -> bool:
    """
    Check if extreme weather or anomalous prediction occurred.
    - Rainfall > 20mm
    - Predicted price <= 0 or extraordinarily high (> 3x current price)
    """
    if curah_hujan_mm > 20:
        return True
    
    if predicted_price <= 0 or predicted_price > (current_price * 3):
        return True
        
    return False

def get_gemini_fallback(komoditas: str, suhu: float, curah_hujan_mm: float, predicted_price: float, current_price: float) -> str:
    """
    Uses Gemini API to provide a fallback recommendation.
    System Instruction: "You are an expert Agronomist and Market Analyst in Indonesia. Based on this data, give a 2-sentence practical recommendation for a traditional farmer."
    """
    if not GEMINI_API_KEY:
        return "Saran Pakar AI tidak tersedia (API Key tidak ditemukan)."
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash',
            system_instruction="You are an expert Agronomist and Market Analyst in Indonesia. Based on this data, give a 2-sentence practical recommendation for a traditional farmer. Speak in Indonesian."
        )
        
        prompt = f"""
        Data Pertanian & Pasar:
        - Komoditas: {komoditas}
        - Suhu: {suhu} °C
        - Curah Hujan: {curah_hujan_mm} mm
        - Harga Saat Ini: Rp {current_price}
        - Prediksi Harga ML: Rp {predicted_price}
        
        Berikan rekomendasi apakah sebaiknya petani panen, tunda, atau mengambil tindakan mitigasi tertentu.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Failed to generate Gemini content: {e}")
        return "Sistem AI Pakar sedang mengalami kendala teknis."

def ask_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API Key tidak ditemukan."
    try:
        model = genai.GenerativeModel('gemini-2.5-flash',
            system_instruction="Kamu adalah asisten AI pakar pertanian Indonesia (PintarTani). Jawablah dengan singkat, padat, langsung pada poin pentingnya saja tanpa basa-basi atau pernyataan yang tidak perlu agar hemat token dan mudah dipahami."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gagal generate Gemini content: {e}")
        return "Terjadi kendala saat menghubungi AI Gemini."

def stream_ask_gemini(prompt: str):
    if not GEMINI_API_KEY:
        yield "Error: Gemini API Key tidak ditemukan."
        return
    try:
        model = genai.GenerativeModel('gemini-2.5-flash',
            system_instruction="Kamu adalah asisten AI pakar pertanian Indonesia (PintarTani). Jawablah dengan singkat, padat, langsung pada poin pentingnya saja tanpa basa-basi atau pernyataan yang tidak perlu agar hemat token dan mudah dipahami."
        )
        response = model.generate_content(prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.error(f"Gagal stream Gemini content: {e}")
        yield f"Error: {str(e)}"
