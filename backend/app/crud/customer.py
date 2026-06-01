# backend/app/crud/customer.py
# Purpose: Direct queries and database actions specifically for the Customer model.

from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    def get_by_email(self, db: Session, email: str) -> Customer | None:
        """Fetch a single customer record by their unique email."""
        return db.query(self.model).filter(self.model.email == email).first()

customer = CRUDCustomer(Customer)
