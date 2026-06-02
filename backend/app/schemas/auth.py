# backend/app/schemas/auth.py
# Purpose: Pydantic models representing authentication requests and token payloads.

from pydantic import BaseModel, EmailStr, Field
from app.schemas.customer import CustomerResponse

class UserLogin(BaseModel):
    """Schema representing user credentials for authentication."""
    email: EmailStr = Field(
        ..., 
        description="The user's registered email address",
        examples=["jane.doe@example.com"]
    )
    password: str = Field(
        ..., 
        min_length=6,
        description="The user's login password",
        examples=["superSecret123"]
    )

class Token(BaseModel):
    """Schema representing the successful authentication response containing JWT."""
    access_token: str = Field(..., description="The generated JSON Web Token access token")
    token_type: str = Field("bearer", description="The token authentication type (bearer)")
    user: CustomerResponse = Field(..., description="The details of the authenticated customer user")
