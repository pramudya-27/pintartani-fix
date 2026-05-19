import os
import uuid
import smtplib
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from backend.database import get_db
from backend.models import User, UsageQuota, PasswordResetToken

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

router = APIRouter()

# --- Schemas ---
class UserCreate(BaseModel):
    """Schema untuk data registrasi pengguna baru."""
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema untuk data kredensial login pengguna."""
    username_or_email: str
    password: str

class Token(BaseModel):
    """Schema untuk token autentikasi JWT setelah sukses login."""
    access_token: str
    token_type: str
    username: str
    quota_left: int

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# --- Utils ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def send_reset_email(to_email: str, token: str):
    # 1. Coba kirim via Brevo API (HTTP/HTTPS)
    brevo_api_key = os.getenv("BREVO_API_KEY")
    if brevo_api_key:
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "api-key": brevo_api_key,
                "content-type": "application/json"
            }
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
            reset_link = f"{frontend_url}/?token={token}"
            sender_email = os.getenv("SMTP_USER", "diopramudya73@gmail.com")

            payload = {
                "sender": {"name": "PintarTani", "email": sender_email},
                "to": [{"email": to_email}],
                "subject": "Reset Password - PintarTani",
                "htmlContent": f"""<html><body>
                    <h3>Halo,</h3>
                    <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda di PintarTani.</p>
                    <p>Silakan klik link berikut untuk mereset password Anda (berlaku selama 15 menit):</p>
                    <p><a href="{reset_link}" style="background-color: #4a8c32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a></p>
                    <p>Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan link berikut di browser Anda:</p>
                    <p>{reset_link}</p>
                    <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
                    <br/>
                    <p>Salam,<br/>Tim PintarTani</p>
                </body></html>"""
            }
            
            response = httpx.post(url, headers=headers, json=payload)
            if response.status_code in [200, 201, 202]:
                print(f"✅ Reset email successfully sent to {to_email} via Brevo API")
                return True
            else:
                print(f"❌ Failed via Brevo API: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Failed to send email via Brevo API: {e}")
            # Lanjut ke metode lain jika Brevo gagal

    # 2. Coba kirim via Resend API (HTTP/HTTPS)
    resend_api_key = os.getenv("RESEND_API_KEY")
    if resend_api_key:
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
            reset_link = f"{frontend_url}/?token={token}"
            email_from = os.getenv("RESEND_FROM", "onboarding@resend.dev")
            
            payload = {
                "from": email_from,
                "to": [to_email],
                "subject": "Reset Password - PintarTani",
                "html": f"""<html><body>
                    <h3>Halo,</h3>
                    <p>Silakan klik link berikut untuk mereset password Anda:</p>
                    <p><a href="{reset_link}">Reset Password</a></p>
                </body></html>"""
            }
            
            response = httpx.post(url, headers=headers, json=payload)
            if response.status_code in [200, 201, 202]:
                print(f"✅ Reset email successfully sent to {to_email} via Resend API")
                return True
            else:
                print(f"❌ Failed via Resend API: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Failed to send email via Resend API: {e}")
            # Lanjut coba SMTP jika Resend gagal

    # 3. Fallback ke SMTP (Hanya bekerja lancar di Local PC, diblokir di Hugging Face)
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        print("⚠️ SMTP/Resend credentials not fully configured. Skipping email sending.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_from
        msg['To'] = to_email
        msg['Subject'] = "Reset Password - PintarTani"

        # URL frontend
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
        reset_link = f"{frontend_url}/?token={token}"
        
        body = f"""Halo,

Anda menerima email ini karena ada permintaan untuk mereset password akun Anda di PintarTani.

Silakan klik link berikut untuk mereset password Anda (berlaku selama 15 menit):
{reset_link}

Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.

Salam,
Tim PintarTani
"""
        msg.attach(MIMEText(body, 'plain'))

        # Koneksi SMTP (Mendukung SSL di port 465 atau TLS)
        port = int(smtp_port)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_host, port)
            server.login(smtp_user, smtp_password)
        else:
            server = smtplib.SMTP(smtp_host, port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            
        server.sendmail(smtp_from, to_email, msg.as_string())
        server.quit()
        print(f"✅ Reset email successfully sent to {to_email} via SMTP")
        return True
    except Exception as e:
        print(f"❌ Failed to send email via SMTP: {e}")
        return False

def check_and_deduct_quota(user: User, db: Session):
    quota = db.query(UsageQuota).filter(UsageQuota.user_id == user.id).first()
    now = datetime.utcnow()

    # Create quota record if not exists
    if not quota:
        quota = UsageQuota(user_id=user.id, usage_count=0, reset_time=now)
        db.add(quota)
        db.commit()
        db.refresh(quota)

    # Check reset time
    if now >= quota.reset_time:
        # Reset quota
        quota.usage_count = 0
        db.commit()

    if quota.usage_count >= 5:
        # Calculate time left
        time_left = quota.reset_time - now
        hours, remainder = divmod(time_left.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        time_str = f"{hours} jam {minutes} menit"
        raise HTTPException(status_code=429, detail=f"Kuota habis. Silakan tunggu {time_str} lagi.")

    # Jika baru mulai pakai dari 0 (baru atau baru reset), set reset_time 5 jam dari sekarang
    if quota.usage_count == 0:
        quota.reset_time = now + timedelta(hours=5)

    # Deduct quota (increment usage)
    quota.usage_count += 1
    
    db.commit()
    return 5 - quota.usage_count

# --- Endpoints ---
@router.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password harus 6 karakter atau lebih")

    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="email atau username tidak boleh sama")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize Quota
    quota = UsageQuota(user_id=new_user.id, usage_count=0, reset_time=datetime.utcnow())
    db.add(quota)
    db.commit()

    return {"message": "Registrasi berhasil"}

@router.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == user_data.username_or_email) | 
        (User.email == user_data.username_or_email)
    ).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Kredensial tidak valid")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    quota = db.query(UsageQuota).filter(UsageQuota.user_id == user.id).first()
    quota_left = 5
    if quota:
        if datetime.utcnow() >= quota.reset_time and quota.usage_count >= 5:
            quota_left = 5
        else:
            quota_left = 5 - quota.usage_count
            if quota_left < 0: quota_left = 0

    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username,
        "quota_left": quota_left
    }

@router.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="maaf email tidak terdaftar")

    reset_token = str(uuid.uuid4())
    # Token berlaku 15 menit
    expires = datetime.utcnow() + timedelta(minutes=15)
    
    db_token = PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires,
        is_used=False
    )
    db.add(db_token)
    db.commit()
    
    # Kirim email asli menggunakan SMTP
    send_reset_email(user.email, reset_token)

    return {"message": "Link reset password berhasil dikirim ke email Anda."}

@router.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password harus 6 karakter atau lebih")

    db_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == req.token).first()
    
    if not db_token:
        raise HTTPException(status_code=400, detail="Token tidak valid")
    if db_token.is_used:
        raise HTTPException(status_code=400, detail="Token sudah pernah digunakan")
    if datetime.utcnow() > db_token.expires_at:
        raise HTTPException(status_code=400, detail="Token sudah kedaluwarsa")

    # Update password user
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.password_hash = get_password_hash(req.new_password)
    db_token.is_used = True
    
    db.commit()
    
    return {"message": "Password berhasil diubah"}
