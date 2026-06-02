# backend/app/api/v1/endpoints/dashboard.py
# Purpose: FastAPI routes handling aggregated dashboard metrics for administrators.

from decimal import Decimal
from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.dashboard import AdminDashboardResponse, CustomerDashboardResponse

router = APIRouter()

@router.get(
    "/admin",
    response_model=AdminDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve aggregate statistics for the Admin Dashboard",
    description="Loads aggregate totals for products, customers, orders, and revenue, plus a list of products with low stock (under 10 units). Restricted to admins.",
    responses={
        status.HTTP_200_OK: {
            "description": "Aggregate statistics successfully calculated and returned."
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Not authenticated or token invalid."
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "The user does not have administrative privileges."
        }
    }
)
def get_admin_dashboard(
    *,
    db: Session = Depends(deps.get_db),
    current_admin: Customer = Depends(deps.get_current_admin)
) -> AdminDashboardResponse:
    # 1. Calculate count of all product records
    total_products = db.query(func.count(Product.id)).scalar() or 0

    # 2. Calculate count of registered customer records (excluding admins)
    total_customers = db.query(func.count(Customer.id)).filter(Customer.role == "customer").scalar() or 0

    # 3. Calculate count of all placed orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    # 4. Calculate aggregate revenue (sum of total_amount on orders)
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or Decimal("0.00")

    # 5. Fetch products whose stock quantity falls below the threshold of 10 units
    low_stock_products = db.query(Product).filter(Product.stock_quantity < 10).all()

    # 6. Fetch the 5 most recent orders placed in the system
    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return AdminDashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock_products,
        recent_orders=recent_orders
    )

@router.get(
    "/customer",
    response_model=CustomerDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve statistics and recent history for the Customer Dashboard",
    description="Loads the authenticated customer's name, total orders count, 5 most recent orders, and 5 distinct most recently ordered products. Restricted to logged-in customers/users.",
    responses={
        status.HTTP_200_OK: {
            "description": "Customer dashboard statistics successfully retrieved."
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Not authenticated or token invalid."
        }
    }
)
def get_customer_dashboard(
    *,
    db: Session = Depends(deps.get_db),
    current_user: Customer = Depends(deps.get_current_user)
) -> CustomerDashboardResponse:
    # 1. Retrieve customer name
    customer_name = current_user.name

    # 2. Retrieve total orders count placed by the authenticated customer
    total_orders = db.query(func.count(Order.id)).filter(Order.customer_id == current_user.id).scalar() or 0

    # 3. Retrieve the 5 most recent orders placed by the authenticated customer
    recent_orders = (
        db.query(Order)
        .filter(Order.customer_id == current_user.id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    # 4. Retrieve up to 5 distinct products most recently ordered by this customer
    recent_products = (
        db.query(Product)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.customer_id == current_user.id)
        .group_by(Product.id)
        .order_by(func.max(Order.created_at).desc())
        .limit(5)
        .all()
    )

    return CustomerDashboardResponse(
        customer_name=customer_name,
        total_orders=total_orders,
        recent_orders=recent_orders,
        recent_products=recent_products
    )
