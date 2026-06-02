# backend/app/schemas/order.py
# Purpose: Pydantic models for order validation and serialization.
# Provides detailed descriptions and JSON schema examples to enrich Swagger interactive docs.

from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.product import ProductResponse

# =====================================================================
# ORDER ITEM SCHEMAS
# =====================================================================

class OrderItemBase(BaseModel):
    product_id: int = Field(
        ..., 
        gt=0, 
        description="The unique database ID of the product being purchased",
        examples=[1]
    )
    quantity: int = Field(
        ..., 
        gt=0, 
        description="The quantity of this product ordered. Must be at least 1",
        examples=[2]
    )

class OrderItemCreate(OrderItemBase):
    """Schema representing an item in an order placement request."""
    pass

class OrderItemResponse(OrderItemBase):
    """Schema representing a purchased item returned in order queries."""
    id: int = Field(..., description="Unique database ID of this order line item", examples=[10])
    order_id: int = Field(..., description="The ID of the parent order", examples=[5])
    
    # Historic unit price at purchase time (prevents discrepancies if active product prices change later)
    price: Decimal = Field(
        ..., 
        decimal_places=2, 
        description="The historical unit price of the product at checkout time",
        examples=[Decimal("89.99")]
    )
    
    # Optional nested details for enhanced frontend representation
    product: ProductResponse | None = None

    model_config = ConfigDict(from_attributes=True)

# =====================================================================
# ORDER SCHEMAS
# =====================================================================

class OrderCreate(BaseModel):
    """Schema for submitting a new order."""
    customer_id: int | None = Field(
        None, 
        description="The database ID of the customer placing the order. If submitted by a customer, this is automatically set to the authenticated customer's ID.",
        examples=[42]
    )
    items: list[OrderItemCreate] = Field(
        ..., 
        min_length=1, 
        description="List of items in the order. Must contain at least one item",
        examples=[[{"product_id": 1, "quantity": 2}]]
    )

class OrderResponse(BaseModel):
    """Schema representing order summary data returned in API responses."""
    id: int = Field(..., description="Unique database ID of the order", examples=[5])
    customer_id: int = Field(..., description="The ID of the customer who placed the order", examples=[42])
    total_amount: Decimal = Field(
        ..., 
        decimal_places=2, 
        description="The calculated total order cost (sum of all items multiplied by their unit prices)",
        examples=[Decimal("179.98")]
    )
    created_at: datetime = Field(..., description="Timestamp of when the order was successfully completed")
    items: list[OrderItemResponse] = Field(..., description="List of line items included in this order")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 5,
                "customer_id": 42,
                "total_amount": "179.98",
                "created_at": "2026-06-01T22:35:00Z",
                "items": [
                    {
                        "id": 10,
                        "order_id": 5,
                        "product_id": 1,
                        "quantity": 2,
                        "price": "89.99"
                    }
                ]
            }
        }
    )
