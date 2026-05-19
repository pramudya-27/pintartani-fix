---
title: Pintartani Backend
emoji: 😻
colorFrom: purple
colorTo: yellow
sdk: docker
pinned: false
license: mit
---

# PintarTani Backend

PintarTani Backend adalah layanan API server yang dibangun dengan **FastAPI** untuk mendukung platform **PintarTani**—sebuah platform cerdas yang membantu petani tradisional Indonesia memprediksi harga komoditas (Bawang Merah, Cabai Rawit, Tomat), memberikan rekomendasi tindakan bertani berbasis AI dan kondisi cuaca, serta menyediakan asisten tanya-jawab (chatbot) pertanian berbasis AI.

Layanan ini terintegrasi dengan model Machine Learning (ML), sistem pengambilan keputusan otomatis (Decision Engine), model bahasa besar (LLM) seperti Gemini, Qwen, dan DeepSeek, serta sistem antrean tugas latar belakang (Background Jobs).

---

## 🛠️ Tech Stack & Arsitektur

- **Framework API**: FastAPI (Python 3.10)
- **Web Server**: Uvicorn
- **Database ORM**: SQLAlchemy dengan driver PyMySQL
- **Database**: MySQL (Mendukung Aiven Cloud DB dengan pengaturan timeout khusus)
- **Machine Learning**: Scikit-Learn (`joblib` untuk load model pre-trained)
- **Integrasi LLM**:
  - Google Gemini API (`gemini-2.5-flash`)
  - Alibaba DashScope API (`qwen3.6-flash` & `deepseek-v4-flash`)
- **Background Scheduler**: APScheduler (Advanced Python Scheduler)
- **Autentikasi**: JSON Web Token (JWT) Bearer, `passlib` dengan enkripsi `bcrypt` untuk hashing password.
- **Pengiriman Email**: Multi-channel fallback (Brevo API -> Resend API -> SMTP Gmail/Custom).

---

## 📁 Struktur Proyek & Penjelasan Berkas

```text
pintartani-backend/
├── backend/
│   ├── __init__.py
│   ├── api_router.py       # Endpoint utama API (Prediksi harga, AI Ask, Streaming)
│   ├── auth_router.py      # Endpoint Autentikasi (Register, Login, Password Reset, Quota)
│   ├── database.py         # Konfigurasi koneksi SQLAlchemy & Database (Aiven compatible)
│   ├── decision_engine.py  # Logika pengambilan keputusan berbasis aturan (Rule-based engine)
│   ├── llm_deepseek.py     # Integrasi LLM DeepSeek V4 Flash via DashScope
│   ├── llm_gemini.py       # Integrasi LLM Gemini 2.5 Flash
│   ├── llm_qwen.py         # Integrasi LLM Qwen 3.6 Flash & Analisis Kondisi Lahan/Pasar
│   ├── ml_service.py       # Handler prediksi Machine Learning (One-Hot Encoded input formatter)
│   └── models.py           # Model database SQLAlchemy (User, UsageQuota, PasswordResetToken)
├── dataset/
│   └── model_pintartani_v1.joblib # Model ML pre-trained (Random Forest / Decision Tree)
├── decision/
│   ├── __init__.py
│   └── recommender.py      # Utilitas logika tanam & panen alternatif
├── scheduler/
│   ├── __init__.py
│   └── jobs.py             # Definisi tugas latar belakang (Scraping, Retrain, Health Check)
├── logs/                   # Log sistem (dibuat otomatis)
├── .env                    # Variabel konfigurasi sensitif (API Keys, DB Credentials)
├── .env.xample             # Contoh berkas konfigurasi .env
├── Dockerfile              # Docker konfiguration untuk deployment (Hugging Face Spaces)
├── requirements.txt        # Daftar pustaka & dependensi Python
├── main.py                 # Runner untuk Background Scheduler
└── start_app.py            # Entry point utama yang menjalankan Scheduler & FastAPI secara bersamaan
```

---

## 🚀 Fitur Utama & Alur Kerja (Workflows)

### 1. Sistem Autentikasi & Pembatasan Kuota (`/api/auth/*`)
- **Pendaftaran & Login**: Menggunakan username dan email unik. Password di-hash menggunakan `bcrypt`. Setelah berhasil login, user menerima JWT Token yang berlaku selama 24 jam.
- **Pembatasan Kuota AI**: Setiap pengguna dibatasi maksimal **5 request AI** (tanya jawab) setiap **5 jam**. Kuota akan otomatis direset setelah jendela waktu 5 jam terlewati. Informasi sisa kuota (`quota_left`) disertakan pada respons login dan setiap respons chat.
- **Multi-channel Password Reset**: Jika pengguna lupa password, sistem mengirimkan link reset berdurasi 15 menit. Pengiriman email memiliki 3 tingkat fallback otomatis:
  1. **Brevo API** (menggunakan HTTP POST - disarankan untuk cloud/Hugging Face).
  2. **Resend API** (menggunakan HTTP POST).
  3. **SMTP Direct** (menggunakan Gmail SMTP / Custom SMTP Server).

### 2. Prediksi Harga & Rekomendasi Pintar (`/api/predict`)
Fitur ini memproses data komoditas (`Bawang Merah`, `Cabai Rawit`, `Tomat`), suhu, curah hujan, harga saat ini, harga H-1, dan harga H-3 untuk menghasilkan prediksi harga di masa mendatang.
- **Prediksi ML**: Mengubah input menjadi data berkode *One-Hot Encoding* dan memprediksi harga menggunakan model Scikit-Learn (`model_pintartani_v1.joblib`). Jika model tidak termuat, sistem menggunakan perhitungan fallback aman (`current_price * 1.05`).
- **Sistem Pengambilan Keputusan**:
  - **Kondisi Cuaca Ekstrem / Anomali**: Jika curah hujan > 20 mm atau harga prediksi anjlok ke $\le 0$ atau melonjak hingga $> 3\times$ harga saat ini, sistem mengabaikan aturan baku dan memanggil **AI Fallback Chain** (DeepSeek V4 $\rightarrow$ Qwen 3.6 $\rightarrow$ Gemini 2.5) untuk merumuskan 2 kalimat rekomendasi mitigasi khusus bagi petani.
  - **Kondisi Normal**: Menggunakan logika berbasis aturan (*rule-based*):
    - Jika harga prediksi $> 15\%$ harga saat ini $\rightarrow$ *"Tahan Panen, harga diprediksi naik!"*
    - Jika harga prediksi $<$ harga saat ini $\rightarrow$ *"Segera Panen sekarang sebelum harga anjlok!"*
    - Lainnya $\rightarrow$ *"Harga relatif stabil. Sesuaikan dengan jadwal panen rutin."*

### 3. Asisten AI Cerdas & SSE Streaming (`/api/ask` & `/api/ask/stream`)
Chatbot pertanian interaktif dengan respons instan atau efek mengetik real-time (Server-Sent Events / SSE).
- **Rantai LLM Dinamis (Dynamic Model Routing)**: Untuk menghemat kuota token API dan mengoptimalkan biaya, model AI yang dipanggil dipilih secara dinamis berdasarkan sisa kuota pengguna saat itu:
  - **Kuota Sisa = 5**: `Gemini AI` $\rightarrow$ `Qwen AI` $\rightarrow$ `DeepSeek AI`
  - **Kuota Sisa = 4 atau 2**: `Qwen AI` $\rightarrow$ `DeepSeek AI` $\rightarrow$ `Gemini AI`
  - **Kuota Sisa = 3 atau 1**: `DeepSeek AI` $\rightarrow$ `Qwen AI` $\rightarrow$ `Gemini AI`
  Sistem akan mencoba model pertama; jika gagal atau terjadi timeout, ia akan mencoba model berikutnya (fallback chain).
- **SSE Streaming**: Mengirimkan data potongan teks secara berkala menggunakan format stream `text/event-stream` sehingga frontend dapat merender animasi mengetik secara mulus.

### 4. Scheduler Latar Belakang (Background Jobs)
Dijalankan secara paralel oleh `main.py` menggunakan `APScheduler`:
- **Scraping Harian (`daily_scraping`)**: Dijadwalkan setiap pukul 01:00 WIB untuk mengumpulkan data cuaca dan harga terbaru.
- **Latih Ulang Mingguan (`weekly_retrain`)**: Dijadwalkan setiap hari Minggu pukul 02:00 WIB untuk memperbarui model Machine Learning dengan data baru yang terkumpul.
- **Detak Jantung (`health_check`)**: Berjalan setiap 1 jam untuk memastikan scheduler tetap aktif dan mencatat log kesehatan di berkas `logs/scheduler.log`.

---

## 🔌 Referensi API Endpoints

### Autentikasi
| Endpoint | Metode | Proteksi Token | Deskripsi |
| :--- | :--- | :---: | :--- |
| `/api/auth/register` | `POST` | ❌ | Mendaftarkan akun pengguna baru |
| `/api/auth/login` | `POST` | ❌ | Autentikasi pengguna & mengembalikan JWT Bearer Token |
| `/api/auth/forgot-password` | `POST` | ❌ | Mengirim tautan reset password ke email jika terdaftar |
| `/api/auth/reset-password` | `POST` | ❌ | Mengganti password lama dengan password baru menggunakan token reset |

### Prediksi & Fitur Utama
| Endpoint | Metode | Proteksi Token | Deskripsi |
| :--- | :--- | :---: | :--- |
| `/api/predict` | `POST` | ❌ | Melakukan prediksi harga berdasarkan model ML & memberikan rekomendasi panen |
| `/api/ask` | `POST` | 🔑 (Bearer) | Tanya jawab dengan AI pertanian (Sekali respons selesai) |
| `/api/ask/stream` | `POST` | 🔑 (Bearer) | Tanya jawab dengan AI dengan format streaming SSE (Server-Sent Events) |

---

## ⚙️ Konfigurasi Lingkungan (`.env`)

Salin `.env.xample` menjadi `.env` lalu sesuaikan isinya:

```ini
# API Keys untuk Model AI
GEMINI_API_KEY=AIzaSy...         # Diperlukan untuk Gemini AI
QWEN_API_KEY=sk-...               # Diperlukan untuk Qwen & Deepseek (Dashscope)
DASHSCOPE_API_KEY=sk-...          # Alias untuk QWEN_API_KEY

# Konfigurasi Database MySQL (Aiven / Local)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pintartani_db

# Alternatif URL database tunggal (jika di-deploy di cloud seperti Hugging Face/Render)
# DATABASE_URL=mysql://user:password@host:port/db_name

# Konfigurasi JWT
JWT_SECRET=supersecretkey_ubah_ini_saat_produksi

# Konfigurasi URL Frontend (untuk link reset password)
FRONTEND_URL=http://localhost:5173

# Konfigurasi Pengiriman Email (Reset Password)
# Opsi 1: Brevo API (Disarankan)
BREVO_API_KEY=xkeysib-...
# Opsi 2: Resend API
RESEND_API_KEY=re_...
RESEND_FROM=onboarding@resend.dev
# Opsi 3: SMTP Standard
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailanda@gmail.com
SMTP_PASSWORD=app_password_gmail
SMTP_FROM=emailanda@gmail.com
```

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- Python 3.10 atau versi di atasnya.
- MySQL Server (atau akses ke Aiven MySQL DB).

### Langkah-langkah
1. **Kloning Proyek & Masuk ke Direktori**:
   ```bash
   cd pintartani-backend
   ```

2. **Buat & Aktifkan Virtual Environment**:
   ```bash
   python -m venv .venv
   # Di Windows (PowerShell/CMD):
   .venv\Scripts\activate
   # Di Linux/macOS:
   source .venv/bin/activate
   ```

3. **Instal Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Siapkan Berkas Lingkungan**:
   Buat berkas `.env` seperti panduan di atas dan pastikan server database MySQL Anda sudah berjalan.

5. **Jalankan Aplikasi**:
   Gunakan runner terintegrasi `start_app.py` yang akan menyalakan server API FastAPI (Uvicorn) dan background scheduler secara bersamaan:
   ```bash
   python start_app.py
   ```
   Server API akan berjalan di alamat **`http://localhost:7860`** (atau port yang dikonfigurasi). Dokumentasi interaktif Swagger UI otomatis tersedia di **`http://localhost:7860/docs`**.

---

## 🐳 Deployment (Docker & Hugging Face Spaces)

Proyek ini siap di-deploy ke Hugging Face Spaces menggunakan Docker SDK. 

- Layanan berjalan di port internal **`7860`** (standar Hugging Face).
- Berkas `Dockerfile` menggunakan `python:3.10-slim` untuk build yang ringan dan cepat.
- Jalankan perintah run container standar jika ingin men-deploy mandiri:
  ```bash
  docker build -t pintartani-backend .
  docker run -p 7860:7860 --env-file .env pintartani-backend
  ```
