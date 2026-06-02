import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.base import Customer

print("DATABASE_URL:", settings.DATABASE_URL)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    customers = db.query(Customer).all()
    print(f"\n--- Customers in Live Neon DB ({len(customers)}) ---")
    for c in customers:
        print(f"ID: {c.id} | Name: {c.name} | Email: {c.email} | Role: {c.role} | Created: {c.created_at}")
finally:
    db.close()
