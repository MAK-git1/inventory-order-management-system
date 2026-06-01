# backend/app/schemas/product.py
# Purpose: Pydantic models for product validation and serialization.
# Provides detailed descriptions and JSON schema examples to enrich Swagger interactive docs.

from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ProductBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=255, 
        description="The catalog name of the product",
        examples=["Developer Mechanical Keyboard"]
    )
    sku: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Stock Keeping Unit. Must be unique across all products",
        examples=["KB-MECH-MXBLUE"]
    )
    price: Decimal = Field(
        ..., 
        gt=0, 
        decimal_places=2, 
        description="Unit price of the product in Decimal format",
        examples=[Decimal("89.99")]
    )
    stock_quantity: int = Field(
        ..., 
        ge=0, 
        description="Current available units in stock",
        examples=[150]
    )

class ProductCreate(ProductBase):
    """Schema used to register a new product."""
    pass

class ProductUpdate(BaseModel):
    """Schema used to update specific attributes of an existing product."""
    name: str | None = Field(None, min_length=1, max_length=255, examples=["Developer Keyboard Pro"])
    sku: str | None = Field(None, min_length=1, max_length=100, examples=["KB-MECH-MXB-PRO"])
    price: Decimal | None = Field(None, gt=0, decimal_places=2, examples=[Decimal("99.99")])
    stock_quantity: int | None = Field(None, ge=0, examples=[200])

class ProductResponse(ProductBase):
    """Schema representing a product returned in API responses."""
    id: int = Field(..., description="Unique database ID of the product", examples=[1])
    created_at: datetime = Field(..., description="Timestamp of when the product was added to the database")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Developer Mechanical Keyboard",
                "sku": "KB-MECH-MXBLUE",
                "price": "89.99",
                "stock_quantity": 150,
                "created_at": "2026-06-01T22:30:00Z"
            }
        }
    )
