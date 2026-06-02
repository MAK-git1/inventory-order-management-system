# backend/app/api/deps.py
# Purpose: Shared dependencies injected into API endpoints.

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.core import security
from app.crud.customer import customer as crud_customer
from app.models.customer import Customer

# Setup OAuth2 password bearer scheme pointing to Login endpoint
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(reusable_oauth2)
) -> Customer:
    """FastAPI Dependency to retrieve the currently authenticated user from the JWT token.
    Verifies JWT token validity, signature, and fetches the user from the database.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[security.ALGORITHM]
        )
        token_data_id: str | None = payload.get("sub")
        if token_data_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: Subject claim missing.",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: Invalid signature or expired token.",
        )
    
    # Retrieve user by primary key ID
    user = crud_customer.get(db, id=int(token_data_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user

def get_current_admin(
    current_user: Customer = Depends(get_current_user)
) -> Customer:
    """FastAPI Dependency enforcing that the active user must be an administrator."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges."
        )
    return current_user

def get_current_customer(
    current_user: Customer = Depends(get_current_user)
) -> Customer:
    """FastAPI Dependency enforcing that the active user must be a customer (or admin)."""
    if current_user.role not in ("customer", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have customer privileges."
        )
    return current_user
