# backend/app/schemas/customer.py
# Purpose: Pydantic models for customer validation and serialization.
# Provides detailed descriptions and JSON schema examples to enrich Swagger interactive docs.

from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class CustomerBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=255, 
        description="The customer's full name",
        examples=["Jane Doe"]
    )
    email: EmailStr = Field(
        ..., 
        description="The customer's unique email address. Checked for format validity",
        examples=["jane.doe@example.com"]
    )
    phone: str | None = Field(
        None, 
        max_length=50, 
        description="Optional customer telephone contact",
        examples=["+1-555-0199"]
    )
    role: str = Field(
        "customer", 
        description="The user's authorization role within the system",
        examples=["customer"]
    )

class CustomerCreate(CustomerBase):
    """Schema used to register a new customer profile."""
    pass

class CustomerSignUp(CustomerBase):
    """Schema used to register a new customer user with a password."""
    password: str = Field(
        ..., 
        min_length=6, 
        description="The customer's secret login password (minimum 6 characters)",
        examples=["superSecret123"]
    )

class CustomerUpdate(BaseModel):
    """Schema used to update specific attributes of an existing customer profile."""
    name: str | None = Field(None, min_length=1, max_length=255, examples=["Jane Smith"])
    email: EmailStr | None = Field(None, examples=["jane.smith@example.com"])
    phone: str | None = Field(None, max_length=50, examples=["+1-555-0200"])

class ProfileUpdate(BaseModel):
    """Schema used to update the logged-in customer's profile details."""
    name: str | None = Field(None, min_length=1, max_length=255, examples=["Jane Smith"])
    email: EmailStr | None = Field(None, examples=["jane.smith@example.com"])
    password: str | None = Field(None, min_length=6, description="Optional new password", examples=["newSecret123"])
    phone: str | None = Field(None, max_length=50, examples=["+1-555-0200"])

class CustomerResponse(CustomerBase):
    """Schema representing a customer profile returned in API responses."""
    id: int = Field(..., description="Unique database ID of the customer record", examples=[42])
    created_at: datetime = Field(..., description="Timestamp of when the customer profile was created")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 42,
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "+1-555-0199",
                "created_at": "2026-06-01T22:30:00Z"
            }
        }
    )
