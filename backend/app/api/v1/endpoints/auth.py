# backend/app/api/v1/endpoints/auth.py
# Purpose: Handle authentication requests, user login, and token generation.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.customer import customer as crud_customer
from app.schemas.customer import CustomerSignUp, CustomerResponse
from app.schemas.auth import UserLogin, Token

router = APIRouter()

@router.post(
    "/signup",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer user",
    description=(
        "Registers a new customer user account in the system. "
        "Performs uniqueness checks on email and hashes the password securely using bcrypt."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "description": "Customer registered successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Email address already registered or validation error."
        }
    }
)
def signup(
    *,
    db: Session = Depends(deps.get_db),
    user_in: CustomerSignUp
) -> CustomerResponse:
    # Validate email uniqueness
    existing_user = crud_customer.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{user_in.email}' is already registered."
        )
    
    # Store user in database with hashed password
    new_user = crud_customer.create_with_password(db, obj_in=user_in)
    return new_user

@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and return JWT access token",
    description="Authenticates user credentials (email and password), validates passwords, and issues a signed JWT containing role claims.",
    responses={
        status.HTTP_200_OK: {
            "description": "User successfully authenticated."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Incorrect email or password."
        }
    }
)
def login(
    *,
    db: Session = Depends(deps.get_db),
    credentials: UserLogin
) -> Token:
    # Retrieve customer user by email
    user = crud_customer.get_by_email(db, email=credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    # Verify password hash
    from app.core.security import verify_password, create_access_token
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    # Generate token containing subject and role claims
    access_token = create_access_token(
        subject={"sub": str(user.id), "role": user.role}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

# Endpoints to be implemented:
# - POST /refresh-token (refreshing active JWT sessions)
