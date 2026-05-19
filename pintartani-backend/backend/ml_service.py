import os
import numpy as np
import logging
from datetime import datetime
import joblib

logger = logging.getLogger(__name__)

# Constants
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset', 'model_pintartani_v1.joblib')

class MLService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                logger.info(f"Model loaded successfully from {MODEL_PATH}")
            else:
                logger.error(f"Model file not found at {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    def format_input(self, data: dict) -> np.ndarray:
        """
        Formats the input into the exact One-Hot Encoded array required by the model.
        Features required:
        ['bulan', 'hari_dalam_minggu', 'suhu_celsius', 'curah_hujan_mm', 'harga_h-1', 'harga_h-3', 
         'komoditas_Bawang Merah', 'komoditas_Cabai Rawit', 'komoditas_Tomat']
        """
        # Determine date features
        target_date = data.get('target_date', datetime.now())
        if isinstance(target_date, str):
            try:
                target_date = datetime.strptime(target_date, "%Y-%m-%d")
            except ValueError:
                target_date = datetime.now()

        bulan = target_date.month
        hari_dalam_minggu = target_date.weekday() # 0 = Monday, 6 = Sunday. Adjust if needed based on model training.

        # Extract numerical features
        suhu_celsius = data.get('suhu_celsius', 27.0)
        curah_hujan_mm = data.get('curah_hujan_mm', 0.0)
        harga_h_1 = data.get('harga_h-1', data.get('harga_sekarang', 0))
        harga_h_3 = data.get('harga_h-3', data.get('harga_sekarang', 0))

        # One-Hot Encoding for commodity
        komoditas = data.get('komoditas', '')
        komoditas_bm = 1 if komoditas.lower() == 'bawang merah' else 0
        komoditas_cr = 1 if komoditas.lower() == 'cabai rawit' else 0
        komoditas_t = 1 if komoditas.lower() == 'tomat' else 0

        # Construct final array (must be 2D array for sklearn predict)
        features = [
            bulan, 
            hari_dalam_minggu, 
            suhu_celsius, 
            curah_hujan_mm, 
            harga_h_1, 
            harga_h_3, 
            komoditas_bm, 
            komoditas_cr, 
            komoditas_t
        ]
        
        return np.array([features])

    def predict(self, feature_array: np.ndarray, current_price: float) -> float:
        """
        Returns the predicted price. Supports a safe fallback if model is not loaded.
        """
        if self.model is None:
            logger.warning("Model is not loaded. Returning a safe fallback prediction.")
            # Fallback: assume price goes up by 5% as a dummy response
            return current_price * 1.05
        
        try:
            prediction = self.model.predict(feature_array)
            return float(prediction[0])
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            # Fallback on error
            return current_price * 1.05

ml_service_instance = MLService()
