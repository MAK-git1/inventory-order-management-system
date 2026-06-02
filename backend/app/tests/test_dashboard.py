# backend/app/tests/test_dashboard.py
# Purpose: Comprehensive integration tests for Admin Dashboard endpoint (GET /dashboard/admin).

import os
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app as fastapi_app
from app.core.database import Base, get_db
import app.models.base  # Register all models for metadata creation
from app.crud.customer import customer as crud_customer
from app.crud.product import product as crud_product
from app.crud.order import order as crud_order
from app.schemas.customer import CustomerSignUp
from app.schemas.product import ProductCreate
from app.schemas.order import OrderCreate, OrderItemCreate
from app.core.security import create_access_token

TEST_DB_FILE = "./test_dashboard.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module", autouse=True)
def override_database_dependency():
    """Dynamically override get_db dependency for the duration of this test module."""
    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield
    fastapi_app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass
            
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def clean_tables(db_session):
    """Clean tables before each test to ensure test isolation."""
    db_session.query(crud_order.model).delete()
    db_session.query(crud_product.model).delete()
    db_session.query(crud_customer.model).delete()
    db_session.commit()

@pytest.fixture
def test_client():
    return TestClient(fastapi_app)

@pytest.fixture
def customer_user(db_session):
    signup_in = CustomerSignUp(
        name="Test Customer",
        email="customer@example.com",
        phone="+1-555-0101",
        password="password123"
    )
    user = crud_customer.create_with_password(db_session, obj_in=signup_in)
    return user

@pytest.fixture
def admin_user(db_session):
    signup_in = CustomerSignUp(
        name="Admin User",
        email="admin@example.com",
        phone="+1-555-0109",
        password="password123"
    )
    user = crud_customer.create_with_password(db_session, obj_in=signup_in)
    user.role = "admin"
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers_customer(customer_user):
    token = create_access_token(subject={"sub": str(customer_user.id), "role": customer_user.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_admin(admin_user):
    token = create_access_token(subject={"sub": str(admin_user.id), "role": admin_user.role})
    return {"Authorization": f"Bearer {token}"}

# =========================================================================
# GET /dashboard/admin Endpoint Tests
# =========================================================================

def test_get_dashboard_unauthorized(test_client):
    """Verify endpoint rejects requests missing a valid Authorization token with 401."""
    response = test_client.get("/api/v1/dashboard/admin")
    assert response.status_code == 401

def test_get_dashboard_forbidden_for_customers(test_client, auth_headers_customer):
    """Verify standard customers are denied access (403) to the admin dashboard."""
    response = test_client.get("/api/v1/dashboard/admin", headers=auth_headers_customer)
    assert response.status_code == 403
    assert "administrative privileges" in response.json()["detail"]

def test_get_dashboard_success_empty_db(test_client, auth_headers_admin):
    """Verify endpoint successfully returns zeroed-out aggregates on an empty database."""
    response = test_client.get("/api/v1/dashboard/admin", headers=auth_headers_admin)
    assert response.status_code == 200
    data = response.json()
    assert data["total_products"] == 0
    assert data["total_customers"] == 0
    assert data["total_orders"] == 0
    assert Decimal(data["total_revenue"]) == Decimal("0.00")
    assert len(data["low_stock_products"]) == 0
    assert len(data["recent_orders"]) == 0

def test_get_dashboard_success_populated_db(test_client, auth_headers_admin, customer_user, db_session):
    """Verify metrics correctly aggregate populated products, stock, orders, and revenue."""
    # 1. Populate Products (some low stock, some healthy)
    p1 = crud_product.create(db_session, obj_in=ProductCreate(
        name="Low Stock Keyboard", sku="SKU-KBD", price=Decimal("89.99"), stock_quantity=3, description="Low stock product"
    ))
    p2 = crud_product.create(db_session, obj_in=ProductCreate(
        name="Healthy Stock Mouse", sku="SKU-MSE", price=Decimal("19.99"), stock_quantity=150, description="Healthy stock product"
    ))
    p3 = crud_product.create(db_session, obj_in=ProductCreate(
        name="Low Stock Cable", sku="SKU-CBL", price=Decimal("9.99"), stock_quantity=5, description="Out of stock product"
    ))

    # 2. Populate Orders
    order1 = OrderCreate(
        customer_id=customer_user.id,
        items=[
            OrderItemCreate(product_id=p1.id, quantity=1), # Low Stock Kbd ($89.99)
            OrderItemCreate(product_id=p2.id, quantity=2)  # Healthy Stock Mouse (2 * $19.99 = $39.98)
        ]
    )
    order2 = OrderCreate(
        customer_id=customer_user.id,
        items=[
            OrderItemCreate(product_id=p3.id, quantity=1)  # Low Stock Cable ($9.99) (Note: stock verification bypassed for simple tests if directly created via transaction or with sufficient inventory set)
        ]
    )
    crud_order.create_order_with_transaction(db_session, obj_in=order1)
    crud_order.create_order_with_transaction(db_session, obj_in=order2)

    # Note: total products = 3, total customers = 1 (customer_user), total orders = 2, total revenue = 89.99 + 39.98 + 9.99 = 139.96
    # Low stock products (stock < 10) = p1 (3) and p3 (0) -> 2 items.

    response = test_client.get("/api/v1/dashboard/admin", headers=auth_headers_admin)
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_products"] == 3
    assert data["total_customers"] == 1
    assert data["total_orders"] == 2
    assert Decimal(data["total_revenue"]) == Decimal("139.96")
    
    low_stock_ids = [prod["id"] for prod in data["low_stock_products"]]
    assert len(low_stock_ids) == 2
    assert p1.id in low_stock_ids
    assert p3.id in low_stock_ids
    assert p2.id not in low_stock_ids
    assert len(data["recent_orders"]) == 2

# =========================================================================
# GET /dashboard/customer Endpoint Tests
# =========================================================================

def test_get_customer_dashboard_unauthorized(test_client):
    """Verify endpoint rejects requests missing a valid Authorization token with 401."""
    response = test_client.get("/api/v1/dashboard/customer")
    assert response.status_code == 401

def test_get_customer_dashboard_success(test_client, auth_headers_customer, customer_user, db_session):
    """Verify customer dashboard successfully aggregates details and filters by 5-count limits."""
    # 1. Create 6 products to test limits
    products = []
    for i in range(6):
        p = crud_product.create(db_session, obj_in=ProductCreate(
            name=f"Product {i}", sku=f"SKU-{i}", price=Decimal("10.00"), stock_quantity=100, description="Test product"
        ))
        products.append(p)

    # 2. Place 6 orders to verify order count and pagination limit
    for i in range(6):
        order_in = OrderCreate(
            customer_id=customer_user.id,
            items=[OrderItemCreate(product_id=products[i].id, quantity=1)]
        )
        crud_order.create_order_with_transaction(db_session, obj_in=order_in)

    response = test_client.get("/api/v1/dashboard/customer", headers=auth_headers_customer)
    assert response.status_code == 200
    data = response.json()

    assert data["customer_name"] == "Test Customer"
    assert data["total_orders"] == 6
    
    # Verify recent_orders limit of 5
    assert len(data["recent_orders"]) == 5
    recent_order_ids = [order["id"] for order in data["recent_orders"]]
    assert len(recent_order_ids) == 5
    
    # Verify recent_products limit of 5 and that they are sorted by recency
    assert len(data["recent_products"]) == 5
    recent_product_names = [prod["name"] for prod in data["recent_products"]]
    assert "Product 5" in recent_product_names
    assert "Product 0" not in recent_product_names

def test_get_customer_dashboard_isolation(test_client, auth_headers_customer, customer_user, db_session):
    """Verify that a customer's dashboard does not contain records from other customers."""
    # Create another customer
    other_signup = CustomerSignUp(
        name="Other User",
        email="other@example.com",
        phone="+1-555-0222",
        password="password123"
    )
    other_user = crud_customer.create_with_password(db_session, obj_in=other_signup)
    
    # Create products
    p1 = crud_product.create(db_session, obj_in=ProductCreate(
        name="Product P1", sku="SKU-P1", price=Decimal("10.00"), stock_quantity=10, description="Test product"
    ))
    
    # Place order for other customer
    order_in = OrderCreate(
        customer_id=other_user.id,
        items=[OrderItemCreate(product_id=p1.id, quantity=1)]
    )
    crud_order.create_order_with_transaction(db_session, obj_in=order_in)
    
    # Get dashboard for main customer (who has placed 0 orders)
    response = test_client.get("/api/v1/dashboard/customer", headers=auth_headers_customer)
    assert response.status_code == 200
    data = response.json()
    
    assert data["customer_name"] == "Test Customer"
    assert data["total_orders"] == 0
    assert len(data["recent_orders"]) == 0
    assert len(data["recent_products"]) == 0
