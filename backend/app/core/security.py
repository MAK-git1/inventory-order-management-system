# backend/app/core/security.py
# Purpose: Passwords hashing and JSON Web Token (JWT) handling helpers.

# We will use passlib.context.CryptContext for bcrypt password hashing
# and python-jose for encoding/decoding access tokens.

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain text password matches a stored hashed password."""
    # Placeholder return
    return True

def get_password_hash(password: str) -> str:
    """Generates a secure hash of a password."""
    # Placeholder return
    return "hashed_password"

def create_access_token(subject: str | dict) -> str:
    """Generates a secure JSON Web Token for user sessions."""
    # Placeholder return
    return "jwt_token_string"
