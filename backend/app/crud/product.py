# backend/app/crud/product.py
# Purpose: Direct queries and database actions specifically for the Product model.

from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_sku(self, db: Session, sku: str) -> Product | None:
        """Fetch a single product record by its unique SKU."""
        return db.query(self.model).filter(self.model.sku == sku).first()

product = CRUDProduct(Product)
