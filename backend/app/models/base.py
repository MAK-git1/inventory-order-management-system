# backend/app/models/base.py
# Purpose: Import and register all SQLAlchemy models in one place so Alembic can discover them easily.

from app.core.database import Base

# Import all models to ensure declarative mapping registration
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
