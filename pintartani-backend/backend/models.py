from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey

from backend.database import Base

class User(Base):
    """Model database SQLAlchemy untuk merepresentasikan data pengguna."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UsageQuota(Base):
    """Model database SQLAlchemy untuk melacak dan membatasi kuota penggunaan AI harian pengguna."""
    __tablename__ = "usage_quotas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    usage_count = Column(Integer, default=0)
    reset_time = Column(DateTime, default=datetime.utcnow)

class PasswordResetToken(Base):
    """Model untuk menyimpan token reset password."""
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
