# backend/app/crud/order.py
# Purpose: Core database queries and transaction controls for order submissions and line items.
# Implements strict validation and atomic stock adjustments to prevent race conditions.

from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate

class CRUDOrder(CRUDBase[Order, OrderCreate, None]):
    def create_order_with_transaction(self, db: Session, *, obj_in: OrderCreate) -> Order:
        """
        Atomically submit an order with connection locks to guarantee integrity.
        Enforces customer validation, product checks, and inventory deduction.
        """
        # 1. Verify Customer Exists
        customer = db.query(Customer).filter(Customer.id == obj_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {obj_in.customer_id} does not exist."
            )

        # Gather cumulative quantities for each distinct product to check stock accurately
        # (Handles cases where the user sends the same product in multiple order items)
        product_quantities = {}
        for item in obj_in.items:
            product_quantities[item.product_id] = product_quantities.get(item.product_id, 0) + item.quantity

        try:
            # 2. Verify Product Exists & Stock Availability
            # Lock the rows using `with_for_update` to prevent race conditions during concurrent stock queries
            # Sorting the product IDs prevents database deadlocks in concurrent environments
            for product_id in sorted(product_quantities.keys()):
                ordered_qty = product_quantities[product_id]
                product_record = db.query(Product).filter(Product.id == product_id).with_for_update().first()
                
                if not product_record:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product with ID {product_id} does not exist."
                    )
                
                # 3. Reject Order if Stock is Insufficient
                if product_record.stock_quantity < ordered_qty:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Insufficient stock for product '{product_record.name}' (SKU: {product_record.sku}). "
                            f"Available: {product_record.stock_quantity}, Requested: {ordered_qty}."
                        )
                    )

                # 4. Automatically Reduce Product Stock
                product_record.stock_quantity -= ordered_qty
                db.add(product_record)

            # Initialize Order model (we will calculate and set total_amount dynamically)
            db_order = Order(
                customer_id=obj_in.customer_id,
                total_amount=Decimal("0.00")
            )
            db.add(db_order)
            db.flush() # Flush to generate primary key db_order.id

            total_amount = Decimal("0.00")

            # 5. Store Order Items & Calculate Total Amount
            for item in obj_in.items:
                product_record = db.query(Product).filter(Product.id == item.product_id).first()
                
                # Fetch unit price (use Decimal conversion to prevent floating-point rounding mismatches)
                item_unit_price = product_record.price
                item_total_price = Decimal(str(item_unit_price)) * item.quantity
                total_amount += item_total_price

                db_order_item = OrderItem(
                    order_id=db_order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item_unit_price # Preserve historic checkout price
                )
                db.add(db_order_item)

            # Update final total cost and persist changes
            db_order.total_amount = total_amount
            db.add(db_order)
            
            db.commit()
            db.refresh(db_order)
            return db_order

        except Exception as e:
            db.rollback() # Rollback standard database transaction on any errors
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected transaction error occurred: {str(e)}"
            )

    def get_by_customer(self, db: Session, *, customer_id: int, skip: int = 0, limit: int = 100) -> list[Order]:
        """Fetch pagination list of orders matching target customer_id."""
        return db.query(self.model).filter(self.model.customer_id == customer_id).offset(skip).limit(limit).all()

order = CRUDOrder(Order)
