# 🌾 PintarTani — Dokumentasi Teknis Lengkap

> Platform Asisten Pertanian Cerdas Berbasis AI untuk Petani Indonesia

---

## 📋 Daftar Isi

1. [Deskripsi Project](#1-deskripsi-project)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Struktur Project](#3-struktur-project)
4. [Tech Stack](#4-tech-stack)
5. [Cara Install dan Run](#5-cara-install-dan-run)
6. [Integrasi API](#6-integrasi-api)
7. [Cara Kerja Sistem](#7-cara-kerja-sistem)
8. [Fitur Utama](#8-fitur-utama)
9. [AI — Model, Routing & Streaming](#9-ai--model-routing--streaming)
10. [Database dan Autentikasi](#10-database-dan-autentikasi)
11. [Dataset / API Eksternal](#11-dataset--api-eksternal)
12. [Deployment](#12-deployment)
13. [Kendala dan Limitasi](#13-kendala-dan-limitasi)
14. [Penutup](#14-penutup)

---

## 1. Deskripsi Project

**PintarTani** adalah platform web berbasis AI yang dirancang khusus untuk membantu petani tradisional Indonesia dalam mengambil keputusan bertani secara lebih cerdas dan berbasis data.

**Tujuan utama platform ini:**

- Memberikan analisis dan estimasi harga komoditas pertanian secara langsung menggunakan LLM.
- Menyajikan analisis risiko cuaca dan dampaknya terhadap distribusi hasil panen berdasarkan konteks yang diberikan user.
- Memberikan rekomendasi tanam, pupuk, dan waktu panen yang optimal berdasarkan kondisi lahan melalui reasoning AI.

**Manfaat bagi petani:**

- Mengurangi risiko kerugian akibat salah waktu panen atau perubahan harga pasar.
- Mendapatkan rekomendasi instan dari AI tanpa harus berkonsultasi ke penyuluh pertanian.
- Akses mudah melalui antarmuka web modern yang dapat digunakan di perangkat apapun.
- Memberikan informasi harga komoditas pertanian yang akurat dan terkini.
- Memberikan informasi risiko cuaca yang akurat dan terkini.

---

## 2. Arsitektur Sistem

PintarTani menggunakan arsitektur **4-layer** yang memisahkan tanggung jawab secara jelas antara frontend, backend, AI, dan data.

```
┌─────────────────────────────────────────────────────────┐
│                    LAYER 1: FRONTEND                    │
│         React 19 + Vite  (http://localhost:5173)        │
│   Formulir Input → SSE Stream Renderer → Riwayat Lokal  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / SSE via Vite Proxy (/api)
┌───────────────────────────▼─────────────────────────────┐
│                    LAYER 2: BACKEND                     │
│          FastAPI + Uvicorn  (http://localhost:7860)     │
│              Auth Router │ API Router                   │
└─────┬────────────────────────────────┬──────────────────┘
      │                                │
┌─────▼──────┐             ┌───────────▼─────────────────┐
│  LAYER 3:  │             │         LAYER 3:            │
│  DATABASE  │             │          AI (LLM)           │
│   MySQL    │             │  Gemini / Qwen / DeepSeek   │
│  (Aiven)   │             └─────────────────────────────┘
└────────────┘
```

**Alur request dari user ke AI:**

1. User mengisi formulir di halaman **Fitur** (frontend).
2. Frontend mengirim `POST /api/ask/stream` dengan Bearer Token JWT ke backend melalui **Vite Proxy**.
3. Backend memverifikasi token, mengecek kuota user, lalu menentukan model AI yang digunakan via **Dynamic Model Routing**.
4. Backend memanggil LLM (Gemini / Qwen / DeepSeek) dan menerima respons.
5. Backend mengalirkan teks secara bertahap ke frontend menggunakan **SSE (Server-Sent Events)**.
6. Frontend merender teks masuk secara real-time melalui komponen `TypewriterEffect`.
7. Setelah selesai, kuota user dikurangi 1 dan diperbarui di `localStorage` serta navbar.

---

## 3. Struktur Project

Repositori terdiri dari dua folder utama: `frontend/` dan `backend/`.

```
pintartani/
│
├── frontend/
│   ├── public/                     # Aset statis publik (logo, gambar)
│   ├── src/
│   │   ├── assets/                 # Gambar & ilustrasi
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigasi + info sisa kuota
│   │   │   ├── PalmBackground.jsx  # Canvas interaktif konstelasi kelapa
│   │   │   ├── TypewriterEffect.jsx# Renderer teks streaming AI
│   │   │   ├── PredictForm.jsx     # [Legacy] Form prediksi lama
│   │   │   └── ResultCard.jsx      # [Legacy] Card hasil analisis lama
│   │   ├── pages/
│   │   │   ├── Beranda.jsx         # Landing page & quick access fitur
│   │   │   ├── Fitur.jsx           # Form analisis AI + SSE handler
│   │   │   ├── Akun.jsx            # Register, Login, Lupa Password
│   │   │   ├── ResetPassword.jsx   # Reset password via token email
│   │   │   ├── Riwayat.jsx         # Riwayat analisis personal
│   │   │   ├── Arsitektur.jsx      # Visualisasi arsitektur 4-layer
│   │   │   └── Tentang.jsx         # Visi & misi platform
│   │   ├── App.jsx                 # Router custom & global state
│   │   ├── App.css                 # Style layout global
│   │   ├── index.css               # Konfigurasi Tailwind v4 & animasi
│   │   └── main.jsx                # Entry point React
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              # Konfigurasi proxy /api → backend
│   └── eslint.config.js
│
└── backend/
    ├── backend/
    │   ├── api_router.py           # Endpoint analisis & AI chat (SSE)
    │   ├── auth_router.py          # Endpoint autentikasi & kuota
    │   ├── database.py             # Koneksi SQLAlchemy & MySQL
    │   ├── decision_engine.py      # Penyusun konteks prompt berbasis aturan
    │   ├── llm_deepseek.py         # Integrasi DeepSeek V4 Flash
    │   ├── llm_gemini.py           # Integrasi Gemini 2.5 Flash
    │   ├── llm_qwen.py             # Integrasi Qwen 3.6 Flash
    │   └── models.py               # Model DB: User, UsageQuota, ResetToken
    ├── decision/
    │   └── recommender.py          # Logika pembentukan konteks prompt rekomendasi
    ├── logs/                       # Log sistem (dibuat otomatis)
    ├── .env                        # Variabel konfigurasi sensitif
    ├── .env.xample                 # Contoh konfigurasi .env
    ├── Dockerfile                  # Konfigurasi Docker untuk deployment
    ├── requirements.txt            # Dependensi Python
    └── start_app.py                # Entry point: FastAPI + Uvicorn
```

---

## 4. Tech Stack

### Frontend

| Kategori    | Teknologi                                         |
| ----------- | ------------------------------------------------- |
| Framework   | React 19 (JavaScript)                             |
| Build Tool  | Vite 8 (HMR)                                      |
| Styling     | Tailwind CSS v4.0                                 |
| UI Design   | CSS Glassmorphism, HTML5 Canvas                   |
| Icons       | Lucide React                                      |
| HTTP Client | Axios (auth), native Fetch + ReadableStream (SSE) |

### Backend

| Kategori      | Teknologi                                                  |
| ------------- | ---------------------------------------------------------- |
| Framework API | FastAPI (Python 3.10)                                      |
| Web Server    | Uvicorn                                                    |
| Database ORM  | SQLAlchemy + PyMySQL                                       |
| Database      | MySQL (lokal / Aiven Cloud)                                |
| LLM           | Google Gemini 2.5 Flash, Qwen 3.6 Flash, DeepSeek V4 Flash |
| Autentikasi   | JWT Bearer + bcrypt (passlib)                              |
| Email         | Brevo API                                                  |
| Deployment    | Docker, Hugging Face Spaces                                |

---

## 5. Cara Install dan Run

### Prasyarat

- **Node.js** v18+ (untuk frontend)
- **Python** 3.10+ (untuk backend)
- **MySQL Server** (lokal atau cloud)
- API Key: Google Gemini, DashScope (Qwen & DeepSeek)

---

### Backend

**Langkah 1 — Masuk ke direktori backend**

```bash
cd pintartani-backend
```

**Langkah 2 — Buat dan aktifkan virtual environment**

```bash
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\activate

# Linux / macOS:
source .venv/bin/activate
```

**Langkah 3 — Install dependensi**

```bash
pip install -r requirements.txt
```

**Langkah 4 — Siapkan file konfigurasi**

Salin `.env.xample` menjadi `.env`, lalu isi sesuai konfigurasi Anda:

```bash
cp .env.xample .env
```

Isi `.env` minimal sebagai berikut:

```env
# API Keys LLM
GEMINI_API_KEY=AIzaSy...
QWEN_API_KEY=sk-...
DASHSCOPE_API_KEY=sk-...

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=pintartani_db

# JWT
JWT_SECRET=supersecretkey_ubah_ini_saat_produksi

# URL Frontend (untuk link reset password)
FRONTEND_URL=http://localhost:5173

# Email — pilih salah satu:
BREVO_API_KEY=xkeysib-...
# atau
RESEND_API_KEY=re_...
# atau
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emailanda@gmail.com
SMTP_PASSWORD=app_password_gmail
SMTP_FROM=emailanda@gmail.com
```

**Langkah 5 — Jalankan server**

```bash
python start_app.py
```

Backend berjalan di `http://localhost:7860`. Dokumentasi Swagger tersedia di `http://localhost:7860/docs`.

---

### Frontend

**Langkah 1 — Masuk ke direktori frontend**

```bash
cd frontend
```

**Langkah 2 — Install dependensi**

```bash
npm install
```

**Langkah 3 — Jalankan mode development**

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Semua request ke `/api` secara otomatis di-proxy ke `http://localhost:7860` melalui konfigurasi Vite.

**Langkah 4 — Build untuk produksi (opsional)**

```bash
npm run build
```

Output statis tersedia di folder `dist/`.

---

## 6. Integrasi API

Semua request dari frontend diarahkan ke `/api` dan di-proxy ke backend.

### Autentikasi

| Endpoint                    | Method | Auth | Payload                           | Response                                             |
| --------------------------- | ------ | ---- | --------------------------------- | ---------------------------------------------------- |
| `/api/auth/register`        | POST   | ❌   | `{ username, email, password }`   | `{ message }`                                        |
| `/api/auth/login`           | POST   | ❌   | `{ username_or_email, password }` | `{ access_token, token_type, username, quota_left }` |
| `/api/auth/forgot-password` | POST   | ❌   | `{ email }`                       | `{ message }`                                        |
| `/api/auth/reset-password`  | POST   | ❌   | `{ token, new_password }`         | `{ message }`                                        |

### Analisis & AI

| Endpoint          | Method | Auth      | Deskripsi                                                      |
| ----------------- | ------ | --------- | -------------------------------------------------------------- |
| `/api/ask`        | POST   | 🔑 Bearer | Tanya jawab & analisis pertanian via AI (respons tunggal)      |
| `/api/ask/stream` | POST   | 🔑 Bearer | Tanya jawab & analisis pertanian via SSE (streaming real-time) |

### Contoh Request — Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username_or_email": "petani123",
  "password": "rahasia456"
}
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "username": "petani123",
  "quota_left": 5
}
```

### Contoh Request — AI Streaming

```http
POST /api/ask/stream
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "prompt": "Apa rekomendasi terbaik untuk menanam cabai di musim hujan?"
}
```

```
data: {"content": "Untuk menanam ", "source": "Gemini", "quota_left": 4}
data: {"content": "cabai di musim hujan, ", "source": "Gemini", "quota_left": 4}
data: {"content": "pastikan drainase lahan baik...", "source": "Gemini", "quota_left": 4}
```

### Contoh Request — Analisis Harga Pasar

```http
POST /api/ask/stream
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "prompt": "Analisis harga Cabai Rawit di Jawa Barat. Harga hari ini Rp45.000/kg, kemarin Rp43.000/kg, tiga hari lalu Rp40.000/kg. Curah hujan 12mm, suhu 28°C. Berikan prediksi tren dan rekomendasi panen."
}
```

```
data: {"content": "Berdasarkan tren harga ", "source": "Gemini", "quota_left": 4}
data: {"content": "yang naik konsisten dalam 3 hari terakhir...", "source": "Gemini", "quota_left": 4}
data: {"content": "Rekomendasi: Tahan panen 2–3 hari ke depan.", "source": "Gemini", "quota_left": 4}
```

---

## 7. Cara Kerja Sistem

### Alur Lengkap: User Input → AI → Hasil

```
User mengisi form di halaman Fitur
        │
        ▼
Frontend (Fitur.jsx) menyusun prompt analisis
        │
        ▼
POST /api/ask/stream + Bearer Token (via Vite Proxy)
        │
        ▼
Backend (auth_router.py) → verifikasi JWT & cek kuota
        │
        ├─ Kuota habis → return 429 (Too Many Requests)
        │
        └─ Kuota tersedia
              │
              ▼
        Dynamic Model Router → pilih urutan LLM
              │
              ▼
        Panggil LLM pertama (misal: Gemini)
              │
              ├─ Berhasil → stream SSE ke frontend
              │
              └─ Gagal/timeout → fallback ke LLM berikutnya
                        │
                        ▼
              Qwen → fallback → DeepSeek
                        │
                        ▼
              SSE dikirim chunk per chunk ke frontend
                        │
                        ▼
              TypewriterEffect.jsx merender teks real-time
                        │
                        ▼
              Kuota dikurangi 1, quota_left diperbarui
              di localStorage & Navbar
                        │
                        ▼
              Hasil disimpan ke riwayat lokal (pt_history_<username>)
```

---

## 8. Fitur Utama

### Frontend

| Fitur                | Deskripsi                                                               |
| -------------------- | ----------------------------------------------------------------------- |
| Beranda              | Landing page dengan hero section dan akses cepat ke semua fitur         |
| Analisis Harga Pasar | Input komoditas & wilayah → estimasi harga, tren, dan saran penjualan   |
| Risiko Cuaca         | Ramalan cuaca 3 hari ke depan + dampak risiko distribusi                |
| Analisis Lahan       | Input pH, tekstur, lokasi → rekomendasi pupuk & jenis tanaman           |
| Prediksi Tanam       | Kalender tanam, estimasi curah hujan, potensi keuntungan                |
| SSE Streaming        | Respons AI dirender real-time seperti efek mengetik (TypewriterEffect)  |
| Riwayat Analisis     | Tersimpan lokal per user, dilengkapi filter kategori & pencarian instan |
| Manajemen Akun       | Register, login, lupa password, reset password, info sisa kuota         |
| Arsitektur Visual    | Halaman visualisasi sistem 4-layer PintarTani                           |

### Backend

| Fitur               | Deskripsi                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| Analisis AI via LLM | Seluruh analisis harga, cuaca, lahan, dan tanam diproses langsung oleh LLM |
| Decision Engine     | Rule-based engine untuk memperkaya konteks prompt sebelum dikirim ke LLM   |
| Dynamic LLM Routing | Pemilihan model AI berdasarkan sisa kuota user                             |
| LLM Fallback Chain  | Jika satu model gagal, sistem otomatis mencoba model berikutnya            |
| SSE Streaming       | Pengiriman respons AI secara bertahap ke frontend                          |
| Manajemen Kuota     | Maksimal 5 request AI per 5 jam, reset otomatis                            |
| Multi-channel Email | Reset password via Brevo → Resend → SMTP (fallback bertingkat)             |

---

## 9. AI — Model, Routing & Streaming

### Model LLM yang Digunakan

| Model    | Provider          | Versi             | Fungsi                               |
| -------- | ----------------- | ----------------- | ------------------------------------ |
| Gemini   | Google AI         | gemini-2.5-flash  | LLM utama, analisis konteks tinggi   |
| Qwen     | Alibaba DashScope | qwen3.6-flash     | LLM sekunder, analisis lahan & pasar |
| DeepSeek | Alibaba DashScope | deepseek-v4-flash | LLM fallback, hemat token            |

### Sistem Dynamic Model Routing

Model AI dipilih secara otomatis berdasarkan sisa kuota user untuk mengoptimalkan biaya dan keandalan:

| Sisa Kuota | Urutan Model (Prioritas → Fallback) |
| ---------- | ----------------------------------- |
| 5          | Gemini → Qwen → DeepSeek            |
| 4 atau 2   | Qwen → DeepSeek → Gemini            |
| 3 atau 1   | DeepSeek → Qwen → Gemini            |

Jika model pertama gagal atau timeout, sistem otomatis mencoba model berikutnya dalam rantai fallback.

### SSE Streaming

Backend menggunakan format `text/event-stream` untuk mengirim respons AI secara bertahap. Setiap chunk dikirim dengan skema:

```json
{"content": "potongan teks...", "source": "Gemini", "quota_left": 4}
```

Frontend membaca stream menggunakan native `fetch` + `ReadableStream` decoder dan merender teks secara real-time melalui komponen `TypewriterEffect.jsx`.

---

## 10. Database dan Autentikasi

### Database — MySQL

Dikelola menggunakan **SQLAlchemy ORM** dengan driver **PyMySQL**. Mendukung koneksi ke MySQL lokal maupun cloud (Aiven) dengan pengaturan timeout khusus untuk stabilitas koneksi jangka panjang.

**Tabel utama:**

| Tabel                   | Deskripsi                                            |
| ----------------------- | ---------------------------------------------------- |
| `users`                 | Menyimpan data akun (username, email, password hash) |
| `usage_quota`           | Melacak sisa kuota AI per user + timestamp reset     |
| `password_reset_tokens` | Token reset password dengan masa berlaku 15 menit    |

### Autentikasi — JWT

- Login menghasilkan **JWT Bearer Token** dengan masa berlaku **24 jam**.
- Semua endpoint yang memerlukan autentikasi menggunakan header `Authorization: Bearer <token>`.
- Password di-hash menggunakan **bcrypt** via library `passlib`.

### Sistem Kuota AI

- Setiap user mendapatkan **maksimal 5 request AI** per jendela waktu **5 jam**.
- Kuota direset otomatis setelah 5 jam berlalu sejak request pertama.
- Informasi `quota_left` dikembalikan di setiap respons login dan respons streaming AI.
- Frontend menyinkronkan kuota ke `localStorage` dan memperbarui tampilan Navbar secara real-time.

---

## 11. API Eksternal yang Digunakan

Seluruh analisis dan rekomendasi di PintarTani diproses sepenuhnya oleh LLM tanpa model ML lokal maupun scraping data. Data konteks (komoditas, cuaca, kondisi lahan) diinput langsung oleh user melalui formulir, kemudian dikirim ke LLM sebagai bagian dari prompt.

| Sumber                      | Jenis     | Fungsi                                              |
| --------------------------- | --------- | --------------------------------------------------- |
| Google Gemini API           | LLM Cloud | Analisis & rekomendasi pertanian (model utama)      |
| Alibaba DashScope API       | LLM Cloud | Model Qwen & DeepSeek sebagai alternatif & fallback |
| Brevo / Resend / Gmail SMTP | Email API | Pengiriman link reset password ke pengguna          |

---

## 12. Deployment

### Docker

Backend dilengkapi `Dockerfile` siap pakai untuk deployment berbasis container.

```bash
# Build image
docker build -t pintartani-backend .

# Jalankan container
docker run -p 7860:7860 --env-file .env pintartani-backend
```

### Hugging Face Spaces

Backend dirancang untuk di-deploy di **Hugging Face Spaces** menggunakan Docker SDK:

- Port internal yang digunakan: **7860** (standar Hugging Face).
- Image dasar: `python:3.10-slim` untuk ukuran container yang ringan.
- Variabel sensitif (API Key, DB credentials) dikonfigurasi sebagai **Secrets** di dashboard Hugging Face.

### Frontend (Produksi)

```bash
npm run build
```

Hasil build di folder `dist/` dapat di-deploy ke:

- **Netlify / Vercel** — deploy langsung dari folder `dist/`.
- **Nginx / Apache** — sajikan folder `dist/` sebagai static files, dan konfigurasikan reverse proxy agar `/api` diarahkan ke port backend.
- **Cloudflare Pages** — integrasi langsung dengan repositori GitHub.

---

## 13. Kendala dan Limitasi

- **Kuota AI terbatas**: Setiap user hanya dapat melakukan 5 request AI per 5 jam, sehingga penggunaan intensif dalam satu sesi akan dibatasi.
- **Akurasi bergantung pada input user**: Karena tidak ada sumber data otomatis, kualitas analisis LLM sepenuhnya bergantung pada kelengkapan dan keakuratan data yang diisi user di formulir.
- **Tidak ada data historis otomatis**: Sistem tidak menyimpan atau mengolah data harga/cuaca dari sumber eksternal secara otomatis. Semua konteks analisis berasal dari input manual.
- **Riwayat analisis tersimpan lokal**: Data riwayat disimpan di `localStorage` browser, bukan di server. Riwayat akan hilang jika user berganti browser atau menghapus cache.
- **Tidak ada offline mode**: Seluruh fitur AI membutuhkan koneksi internet aktif ke API LLM eksternal.
- **Ketergantungan pada API pihak ketiga**: Ketersediaan layanan bergantung pada uptime Google Gemini API dan Alibaba DashScope API. Jika semua provider tidak tersedia, layanan analisis akan terganggu.

---

## 14. Penutup

**PintarTani** menghadirkan solusi nyata bagi petani Indonesia dengan memanfaatkan kekuatan Large Language Model secara penuh. Pendekatan LLM ini membuat sistem lebih ringan, lebih mudah di-deploy, dan lebih fleksibel dalam menangani berbagai jenis pertanyaan pertanian yang kompleks.

Ketahanan sistem dijaga melalui mekanisme fallback berlapis di sisi model AI (Gemini → Qwen → DeepSeek) dan pengiriman email, sehingga tetap dapat memberikan nilai kepada pengguna bahkan ketika satu layanan mengalami gangguan.

Dengan arsitektur yang modular dan dokumentasi yang lengkap, PintarTani siap dikembangkan lebih lanjut baik untuk memperluas cakupan analisis, menambah fitur baru, maupun skalabilitas ke lebih banyak pengguna.

---

_Dokumentasi ini mencakup seluruh komponen teknis PintarTani_
