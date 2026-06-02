# backend/app/crud/customer.py
# Purpose: Direct queries and database actions specifically for the Customer model.

from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerSignUp, ProfileUpdate

class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    def get_by_email(self, db: Session, email: str) -> Customer | None:
        """Fetch a single customer record by their unique email."""
        return db.query(self.model).filter(self.model.email == email).first()

    def create(self, db: Session, *, obj_in: CustomerCreate) -> Customer:
        """Create a new customer profile. Sets a secure default password if not provided."""
        from app.core.security import get_password_hash
        db_obj = Customer(
            name=obj_in.name,
            email=obj_in.email,
            phone=obj_in.phone,
            role=obj_in.role,
            hashed_password=get_password_hash("password123"),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_with_password(self, db: Session, *, obj_in: CustomerSignUp) -> Customer:
        """Create a new customer user with hashed password."""
        from app.core.security import get_password_hash
        db_obj = Customer(
            name=obj_in.name,
            email=obj_in.email,
            phone=obj_in.phone,
            role=obj_in.role,
            hashed_password=get_password_hash(obj_in.password),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_profile(self, db: Session, *, db_obj: Customer, obj_in: ProfileUpdate) -> Customer:
        """Update a customer's profile, including secure hashing if password is provided."""
        from app.core.security import get_password_hash
        
        update_data = obj_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            if password:
                db_obj.hashed_password = get_password_hash(password)
                
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

customer = CRUDCustomer(Customer)
