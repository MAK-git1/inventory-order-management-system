# backend/app/models/order.py
# Purpose: SQLAlchemy models representing the 'orders' and 'order_items' tables.

from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Customer reference
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    
    # Store aggregated total purchase price
    total_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Parent order reference
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    
    # Ordered product reference (RESTRICT prevents deleting a product if it is in an order history)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    
    # Historic unit price at the exact moment of order completion
    price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
