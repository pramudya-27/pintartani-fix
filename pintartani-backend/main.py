# main.py
import os
import sys
import logging
import time
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

# 1. PATH CONFIGURATION
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# 2. LOAD ENVIRONMENT VARIABLES
load_dotenv()

# 3. IMPORT INTERNAL MODULES
try:
    from scheduler import daily_scraping, weekly_retrain, health_check
    print("✅ Semua modul scheduler internal berhasil dimuat!")
except ImportError as e:
    print(f"❌ Gagal memuat modul scheduler: {e}")
    sys.exit(1)

# 4. LOGGING SETUP
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/scheduler.log"),
        logging.StreamHandler()
    ]
)

def setup_scheduler():
    scheduler = BackgroundScheduler(timezone="Asia/Jakarta")
    scheduler.add_job(daily_scraping, 'cron', hour=1, minute=0)
    scheduler.add_job(weekly_retrain, 'cron', day_of_week='sun', hour=2, minute=0)
    scheduler.add_job(health_check, 'interval', hours=1)
    scheduler.start()
    logging.info("⏰ Scheduler aktif.")
    return scheduler

def main():
    sched = setup_scheduler()
    logging.info("🚀 PintarTani Scheduler sedang berjalan...")
    
    try:
        # Loop utama agar scheduler tetap aktif di background
        while True:
            time.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler dihentikan.")
    finally:
        if sched.running:
            sched.shutdown()
        logging.info("Sistem dihentikan.")

if __name__ == "__main__":
    main()