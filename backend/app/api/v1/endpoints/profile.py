# backend/app/api/v1/endpoints/profile.py
# Purpose: FastAPI routes handling logged-in user profile retrieval and updates.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.customer import customer as crud_customer
from app.models.customer import Customer
from app.schemas.customer import CustomerResponse, ProfileUpdate

router = APIRouter()

@router.get(
    "/",
    response_model=CustomerResponse,
    summary="Retrieve own profile information",
    description="Fetches details of the currently authenticated customer user session based on their JWT token.",
    responses={
        status.HTTP_200_OK: {
            "description": "Profile details retrieved successfully."
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Not authenticated or token invalid."
        }
    }
)
def get_profile(
    current_user: Customer = Depends(deps.get_current_user)
) -> Customer:
    return current_user

@router.put(
    "/",
    response_model=CustomerResponse,
    summary="Update own profile information",
    description="Updates the currently authenticated user's profile details. Allows changing full name, email, and password.",
    responses={
        status.HTTP_200_OK: {
            "description": "Profile updated successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Email address already registered by another customer or validation error."
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Not authenticated or token invalid."
        }
    }
)
def update_profile(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: ProfileUpdate,
    current_user: Customer = Depends(deps.get_current_user)
) -> Customer:
    # If email is being updated, verify it is unique
    if profile_in.email and profile_in.email != current_user.email:
        existing_user = crud_customer.get_by_email(db, email=profile_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{profile_in.email}' is already in use by another user."
            )
            
    # Perform update
    updated_user = crud_customer.update_profile(db=db, db_obj=current_user, obj_in=profile_in)
    return updated_user
