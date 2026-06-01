# backend/app/api/v1/endpoints/customers.py
# Purpose: FastAPI routes handling customer listings, creation, retrieval, updates, and removals.
# Enriched with advanced OpenAPI/Swagger documentation metadata for professional /docs exposure.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.customer import customer as crud_customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter()

@router.post(
    "/", 
    response_model=CustomerResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer",
    description=(
        "Registers a new customer profile in the database. "
        "Enforces email address validation and uniqueness checks."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "description": "Customer profile registered successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Email address already registered or validation error."
        }
    }
)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_in: CustomerCreate
) -> CustomerResponse:
    existing_customer = crud_customer.get_by_email(db, email=customer_in.email)
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_in.email}' already exists."
        )
    return crud_customer.create(db=db, obj_in=customer_in)

@router.get(
    "/{id}", 
    response_model=CustomerResponse,
    summary="Retrieve a customer by ID",
    description="Fetches details of a registered customer profile by database ID key.",
    responses={
        status.HTTP_200_OK: {
            "description": "Customer details retrieved successfully."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The customer with the specified ID was not found."
        }
    }
)
def read_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: int
) -> CustomerResponse:
    customer_record = crud_customer.get(db=db, id=id)
    if not customer_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    return customer_record

@router.get(
    "/", 
    response_model=list[CustomerResponse],
    summary="List all customers",
    description="Fetches multiple customer profiles supporting pagination offsets and limits."
)
def read_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> list[CustomerResponse]:
    return crud_customer.get_multi(db=db, skip=skip, limit=limit)

@router.put(
    "/{id}", 
    response_model=CustomerResponse,
    summary="Update an existing customer",
    description=(
        "Updates attributes of a customer profile. "
        "If email is modified, validates that the target email is not already claimed by another user."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Customer updated successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Email already claimed or validation error."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The customer with the specified ID was not found."
        }
    }
)
def update_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    customer_in: CustomerUpdate
) -> CustomerResponse:
    customer_record = crud_customer.get(db=db, id=id)
    if not customer_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    
    if customer_in.email and customer_in.email != customer_record.email:
        existing_customer = crud_customer.get_by_email(db, email=customer_in.email)
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer_in.email}' already exists."
            )
            
    return crud_customer.update(db=db, db_obj=customer_record, obj_in=customer_in)

@router.delete(
    "/{id}", 
    response_model=CustomerResponse,
    summary="Delete a customer",
    description="Removes a customer profile permanently from the system registry.",
    responses={
        status.HTTP_200_OK: {
            "description": "Customer profile deleted successfully."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The customer with the specified ID was not found."
        }
    }
)
def delete_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: int
) -> CustomerResponse:
    customer_record = crud_customer.get(db=db, id=id)
    if not customer_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    return crud_customer.remove(db=db, id=id)
