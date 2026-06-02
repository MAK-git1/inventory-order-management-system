# backend/app/models/customer.py
# Purpose: SQLAlchemy model representing the 'customers' table.

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    
    # Email constraint: Unique and Indexed for fast lookup and validation checks
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    phone = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default="customer", server_default="customer", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships: One-to-many relationship with orders
    # cascade deletes orders if a customer is removed (depending on business rule choice, safe defaults here)
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
