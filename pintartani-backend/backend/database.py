import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

load_dotenv()

host     = os.getenv("DB_HOST", "localhost")
port     = int(os.getenv("DB_PORT", "3306"))
user     = os.getenv("DB_USER", "root")
password = os.getenv("DB_PASSWORD", "")
db_name  = os.getenv("DB_NAME", "pintartani_db")

database_url = os.getenv("DATABASE_URL")

# Timeout sesuai dokumentasi resmi Aiven
TIMEOUT = 10

# connect dengan database aiven
connect_args = {
    "charset": "utf8mb4",
    "connect_timeout": TIMEOUT,
    "read_timeout": TIMEOUT,
    "write_timeout": TIMEOUT,
}

if database_url:
    # Mengganti mysql:// menjadi mysql+pymysql:// agar dikenali SQLAlchemy
    if database_url.startswith("mysql://"):
        url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    else:
        url = database_url

    # Hapus parameter ssl-mode / ssl_mode dari URL (tidak didukung PyMySQL sebagai query param)
    url = re.sub(r'[?&]ssl[-_]mode=[^&]*', '', url)
    url = re.sub(r'\?$', '', url)  # hapus '?' yang tertinggal jika tidak ada param lain
else:
    # Gunakan variabel env individual (sesuai pola dokumentasi Aiven)
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"

try:
    engine = create_engine(
        url,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
    logger.info("✅ Database engine berhasil dibuat.")
except Exception as e:
    logger.error(f"❌ Gagal membuat DB engine: {e}")
    engine = None

if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise Exception("Database tidak terhubung")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
