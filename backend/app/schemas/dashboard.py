# backend/app/schemas/dashboard.py
# Purpose: Pydantic schemas representing the response structures of dashboard endpoints.

from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse

class AdminDashboardResponse(BaseModel):
    """Schema representing the aggregate and listing data for the Admin Dashboard."""
    total_products: int = Field(
        ..., 
        description="The total count of active and inactive products registered in the inventory",
        examples=[240]
    )
    total_customers: int = Field(
        ..., 
        description="The total count of registered customers in the system (excluding admins)",
        examples=[85]
    )
    total_orders: int = Field(
        ..., 
        description="The total count of all orders submitted in the database",
        examples=[312]
    )
    total_revenue: Decimal = Field(
        ..., 
        description="The total aggregate revenue from all completed orders combined",
        examples=[Decimal("12450.75")]
    )
    low_stock_products: list[ProductResponse] = Field(
        ..., 
        description="A list of products whose available stock falls below the threshold of 10 units"
    )
    recent_orders: list[OrderResponse] = Field(
        ...,
        description="List of the 5 most recent orders placed in the system"
    )

class CustomerDashboardResponse(BaseModel):
    """Schema representing the aggregate and history metrics for the Customer Dashboard."""
    customer_name: str = Field(
        ...,
        description="The full name of the authenticated customer",
        examples=["Jane Doe"]
    )
    total_orders: int = Field(
        ...,
        description="The total number of orders placed by this customer",
        examples=[12]
    )
    recent_orders: list[OrderResponse] = Field(
        ...,
        description="List of the 5 most recent orders placed by this customer"
    )
    recent_products: list[ProductResponse] = Field(
        ...,
        description="List of distinct products recently ordered by this customer (up to 5)"
    )
