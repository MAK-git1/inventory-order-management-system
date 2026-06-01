# backend/app/models/product.py
# Purpose: SQLAlchemy model representing the 'products' table.

from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    
    # SKU constraint: Indexed and Unique to enforce business requirements
    sku = Column(String(100), unique=True, index=True, nullable=False)
    
    # Using Numeric instead of Float for price to prevent rounding errors (production best practice)
    price = Column(Numeric(10, 2), nullable=False)
    
    # Tracks currently available stock quantity
    stock_quantity = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
