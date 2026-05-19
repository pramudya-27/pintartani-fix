# decision/recommender.py

def rekomendasi_tanam(suhu, curah_hujan, jenis_tanah):
    """Aturan berbasis rule untuk kelayakan tanam."""
    # Contoh logika sederhana untuk komoditas umum (misal: Cabai)
    if 20 <= suhu <= 30 and curah_hujan < 200:
        if jenis_tanah.lower() in ['lempung', 'regosol']:
            return "Kondisi IDEAL untuk menanam. Pastikan drainase baik."
        return "Kondisi cukup baik, namun perhatikan kecocokan nutrisi tanah."
    return "Kondisi KURANG IDEAL. Disarankan menunggu cuaca lebih stabil."

def rekomendasi_panen(harga_sekarang, harga_prediksi_14hari):
    """Membandingkan harga saat ini dengan prediksi menggunakan threshold 20%."""
    selisih_persen = ((harga_prediksi_14hari - harga_sekarang) / harga_sekarang) * 100
    
    if selisih_persen >= 20:
        return f"TUNDA PANEN. Harga diprediksi naik {selisih_persen:.1f}% dalam 14 hari."
    elif selisih_persen <= -10:
        return f"SEGERA PANEN. Harga diprediksi turun {abs(selisih_persen):.1f}%. Amankan profit sekarang."
    else:
        return "HARGA STABIL. Anda bisa panen sesuai jadwal rutin."