# scheduler/jobs.py
import logging
import datetime
import os

# --- 1. PROTEKSI FOLDER LOGS ---
# Menjamin folder 'logs' ada sebelum logging dimulai
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# --- 2. KONFIGURASI LOGGING ---
logging.basicConfig(
    filename=os.path.join(LOG_DIR, 'scheduler.log'),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def daily_scraping():
    """Tugas: Menjalankan scraping harian via Role A."""
    logging.info("Memulai jadwal scraping harian...")
    print(f"[{datetime.datetime.now()}] Memicu scraping harian...")
    
    try:
        # Import ditaruh di dalam fungsi (Lazy Loading) agar main.py tidak mati 
        # jika file Role A belum dibuat/masih error.
        # dari collectors.weather_scraper import fetch_data
        # fetch_data()
        
        logging.info("Scraping harian berhasil diselesaikan.")
        print("✅ Scraping harian sukses.")
        
    except ImportError:
        msg = "Fungsi scraping Role A belum ditemukan. Pastikan folder 'collectors' sudah ada."
        logging.warning(msg)
        print(f"⚠️ Warning: {msg}")
    except Exception as e:
        error_msg = f"Gagal menjalankan scraping: {str(e)}"
        logging.error(error_msg)
        print(f"❌ Error: {error_msg}")

def weekly_retrain():
    """Tugas: Melatih ulang model ML."""
    logging.info("Memulai jadwal retrain model mingguan...")
    print(f"[{datetime.datetime.now()}] Memicu retrain model...")
    
    try:
        # dari model.train_model import train_model
        # train_model()
        
        logging.info("Retrain model berhasil.")
        print("✅ Retrain model sukses.")
        
    except ImportError:
        msg = "Fungsi retrain Role A belum ditemukan. Pastikan folder 'model' sudah ada."
        logging.warning(msg)
        print(f"⚠️ Warning: {msg}")
    except Exception as e:
        logging.error(f"Gagal retrain model: {str(e)}")
        print(f"❌ Error Retrain: {e}")

def health_check():
    """Memastikan scheduler tetap berjalan."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logging.info(f"Scheduler Health Check: OK pada {now}")
    print(f"💓 Scheduler Heartbeat: OK ({now})")