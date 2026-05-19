def get_recommendation(predicted_price: float, current_price: float) -> str:
    """
    Decision Engine rules:
    - If (Predicted Price > Current Price + 15%), return recommendation: "Tahan Panen, harga diprediksi naik!".
    - If (Predicted Price < Current Price), return: "Segera Panen sekarang sebelum harga anjlok!".
    - Otherwise, general steady market recommendation.
    """
    
    if current_price <= 0:
        return "Harga saat ini tidak valid untuk memberikan rekomendasi."
        
    threshold_up = current_price * 1.15
    
    if predicted_price > threshold_up:
        return "Tahan Panen, harga diprediksi naik!"
    elif predicted_price < current_price:
        return "Segera Panen sekarang sebelum harga anjlok!"
    else:
        return "Harga relatif stabil. Sesuaikan dengan jadwal panen rutin."
