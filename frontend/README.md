# PintarTani — Dashboard Frontend (React + Vite)

PintarTani adalah platform asisten pertanian cerdas berbasis AI yang menyajikan analisis harga pasar real-time, risiko cuaca, diagnosis kondisi lahan, serta rekomendasi tanam bagi para petani di Indonesia. 

Frontend dirancang dengan antarmuka web modern yang memiliki performa tinggi, visual premium (glassmorphism & canvas interaktif), serta dukungan penuh untuk **Server-Sent Events (SSE) / Streaming Response** dari AI layaknya ChatGPT.

---

## 🚀 Fitur Utama & Alur Halaman (Frontend Flow)

Navigasi halaman dikendalikan melalui state global `currentPage` pada `App.jsx` dengan alur sebagai berikut:

1. **Beranda (`beranda`)**
   - Halaman pendaratan (hero section) yang mengenalkan platform PintarTani.
   - Menyediakan akses cepat ke masing-masing fitur analisis.
2. **Fitur (`fitur`)**
   - Halaman kerja utama yang menampung formulir analisis:
     - **Harga Pasar**: Input komoditas & wilayah untuk mendapatkan estimasi harga terkini, tren, dan saran penjualan.
     - **Cuaca & Risiko**: Cek ramalan cuaca 3 hari ke depan beserta dampak risiko distribusinya.
     - **Analisis Lahan**: Input pH, tekstur tanah, dan lokasi untuk memperoleh rekomendasi pupuk & tanaman yang cocok.
     - **Prediksi Tanam**: Estimasi kalender tanam, curah hujan, serta potensi keuntungan.
   - Seluruh formulir di halaman ini mengirimkan prompt analisis ke backend dan merender hasilnya dalam mode **real-time streaming text (SSE)** menggunakan komponen `TypewriterEffect`.
3. **Riwayat (`riwayat`)**
   - Halaman untuk melihat kembali hasil analisis yang pernah dilakukan.
   - Riwayat disimpan secara lokal berdasarkan user yang sedang aktif (`pt_history_<username>`).
   - Menyediakan fitur pencarian instan dan filter kategori analisis.
   - Halaman ini diproteksi, otomatis mengalihkan pengguna ke Beranda jika sesi telah berakhir atau belum masuk (login).
4. **Arsitektur (`arsitektur`)**
   - Visualisasi penjelasan sistem 4-layer PintarTani.
5. **Tentang (`tentang`)**
   - Visi dan misi dari pengembangan platform PintarTani.
6. **Akun & Sesi (`akun` & `reset-password`)**
   - Pendaftaran akun baru, login user, lupa password, reset password, dan logout.
   - Menampilkan status sisa kuota (maksimal 5 kuota untuk pemakaian model AI).

---

## 🛠️ Tech Stack & Dependensi

* **Core Framework**: React 19 (JavaScript) & Vite 8 (HMR super cepat).
* **Styling**: Tailwind CSS v4.0 (menawarkan performa styling modern dengan load time cepat).
* **Design & Animations**:
  - CSS Glassmorphism (`glass-card`) untuk tampilan UI melayang semi-transparan.
  - Interactive HTML5 Canvas (`PalmBackground.jsx`) yang menggambar konstelasi pohon kelapa interaktif yang bereaksi terhadap kursor mouse.
  - Custom animation entry page & input interaction untuk nuansa aplikasi premium.
* **Icons**: Lucide React.
* **HTTP Client**: 
  - `axios` untuk request API autentikasi konvensional.
  - Native `fetch` dengan `ReadableStream` decoder untuk memproses stream data SSE dari AI.

---

## 📂 Struktur Direktori

```bash
frontend/
├── public/                 # Aset statis publik (Logo, Gambar, dll)
├── src/
│   ├── assets/             # Aset gambar & ilustrasi
│   ├── components/         # Komponen UI Reusable
│   │   ├── Navbar.jsx          # Bar navigasi dengan responsive layout & info kuota
│   │   ├── PalmBackground.jsx  # Efek canvas background interaktif (Konstelasi Pohon Kelapa)
│   │   ├── TypewriterEffect.jsx# Efek mengetik dinamis untuk merender AI stream
│   │   ├── PredictForm.jsx     # [Legacy/Unused] Komponen form prediksi lama
│   │   └── ResultCard.jsx      # [Legacy/Unused] Komponen card hasil analisis lama
│   ├── pages/              # Komponen Halaman (Page Components)
│   │   ├── Beranda.jsx         # Halaman utama & Quick access
│   │   ├── Fitur.jsx           # Logic & Layout formulir analisis AI (SSE)
│   │   ├── Akun.jsx            # Autentikasi (Register, Login, Forgot Password)
│   │   ├── ResetPassword.jsx   # Pengaturan ulang sandi via email recovery link
│   │   ├── Riwayat.jsx         # Daftar riwayat analisis personal, filter, & search
│   │   ├── Arsitektur.jsx      # Penjelasan 4-layer arsitektur sistem
│   │   └── Tentang.jsx         # Visi & Misi PintarTani
│   ├── App.css             # Style khusus untuk layout global
│   ├── App.jsx             # Router custom & Global state (Auth, Page State, Quota)
│   ├── index.css           # Konfigurasi Tailwind v4 theme, global custom animations & styles
│   └── main.jsx            # Entrypoint React
├── eslint.config.js        # Konfigurasi linter kode
├── index.html              # HTML Shell utama
├── package.json            # Daftar script running & dependensi library
└── vite.config.js          # Konfigurasi server & reverse proxy API backend
```

---

## 🔗 Integrasi Backend (API Endpoint Map)

Semua request yang mengarah ke `/api` akan dijembatani otomatis melalui Vite Proxy ke server backend. Berdasarkan konfigurasi di `vite.config.js`:

| Endpoint Frontend | Method | Payload / Request Body | Response / Output | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | `{ username, email, password }` | `{ message }` | Pendaftaran akun baru |
| `/api/auth/login` | `POST` | `{ username_or_email, password }` | `{ access_token, token_type, username, quota_left }` | Autentikasi pengguna & inisiasi sesi |
| `/api/auth/forgot-password` | `POST` | `{ email }` | `{ message }` | Mengirim link reset password via email |
| `/api/auth/reset-password` | `POST` | `{ token, new_password }` | `{ message }` | Memperbarui password menggunakan token recovery |
| `/api/ask/stream` | `POST` | `{ prompt }` | *Server-Sent Events stream* (SSE) | Mendapatkan respons AI secara bertahap (Streaming) |

> [!IMPORTANT]
> - Endpoint `/api/ask/stream` mewajibkan Header `Authorization: Bearer <pt_token>`.
> - Data SSE yang diterima dikirim dengan skema format `data: {"content": "...", "source": "Gemini", "quota_left": 4}`.
> - `source` merupakan nama model AI yang aktif (Gemini/DeepSeek/Qwen) hasil auto-routing / fallback dari backend.
> - `quota_left` diperbarui secara real-time pada local storage & navbar setiap kali selesai melakukan query.

---

## ⚙️ Cara Menjalankan Project

### 1. Instalasi Dependensi
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di komputer Anda. Jalankan perintah berikut di root folder `frontend/`:
```bash
npm install
```

### 2. Jalankan Mode Development
Untuk menjalankan frontend secara lokal dengan fitur Hot Module Replacement (HMR):
```bash
npm run dev
```
Secara default, aplikasi akan berjalan di `http://localhost:5173`. Request `/api` akan secara otomatis di-proxy-kan ke URL backend yang didefinisikan di `vite.config.js`.

### 3. Build untuk Produksi
Gunakan perintah ini untuk memaketkan kode frontend menjadi file HTML, CSS, dan JS statis yang optimal di folder `dist/`:
```bash
npm run build
```

---

## 💡 Konfigurasi Tambahan untuk Penggabungan Backend

Saat Anda ingin menggabungkan repositori frontend ini dengan backend (misalnya yang menggunakan FastAPI), perhatikan konfigurasi proxy di `vite.config.js`:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // Ganti dengan alamat backend lokal Anda jika diperlukan
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```
Jika dalam tahap production, pastikan server Anda (Nginx/Apache/Cloudflare) dikonfigurasi untuk mengalihkan rute `/api` ke port aplikasi backend, atau Anda dapat menyesuaikan konfigurasi CORS di backend agar mengizinkan domain frontend mengakses API secara langsung.
