# backend/app/core/security.py
# Purpose: Passwords hashing and JSON Web Token (JWT) handling helpers.

# Monkeypatch bcrypt to prevent passlib checkpw ValueError on newer python-bcrypt versions
import bcrypt
_original_hashpw = bcrypt.hashpw
def _safe_hashpw(password, salt):
    if len(password) > 72:
        password = password[:72]
    return _original_hashpw(password, salt)
bcrypt.hashpw = _safe_hashpw

from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# CryptContext configured for bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day session lifespan default


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Verifies that a plain text password matches a stored hashed password."""
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to plain text comparison to support legacy or unhashed credentials
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """Generates a secure hash of a password."""
    return pwd_context.hash(password)

def create_access_token(subject: str | dict, expires_delta: timedelta | None = None) -> str:
    """Generates a secure JSON Web Token for user sessions."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire}
    if isinstance(subject, dict):
        to_encode.update(subject)
    else:
        to_encode.update({"sub": str(subject)})
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
