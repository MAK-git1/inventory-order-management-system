# backend/app/tests/test_orders.py
# Purpose: Comprehensive integration tests for Orders APIs (POST /orders/, GET /orders/{id}, GET /orders/).

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

TEST_DB_FILE = "./test_orders.db"
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
    # Delete dependent order items and orders first, then products and customers
    db_session.query(crud_order.model).delete()
    db_session.query(crud_product.model).delete()
    db_session.query(crud_customer.model).delete()
    db_session.commit()

@pytest.fixture
def test_client():
    return TestClient(fastapi_app)

@pytest.fixture
def customer_user1(db_session):
    signup_in = CustomerSignUp(
        name="Customer One",
        email="customer1@example.com",
        phone="+1-555-0101",
        password="password123"
    )
    user = crud_customer.create_with_password(db_session, obj_in=signup_in)
    return user

@pytest.fixture
def customer_user2(db_session):
    signup_in = CustomerSignUp(
        name="Customer Two",
        email="customer2@example.com",
        phone="+1-555-0102",
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
    # Elevate privilege to Admin
    user.role = "admin"
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def product_item1(db_session):
    product_in = ProductCreate(
        name="Product One",
        sku="SKU-PROD1",
        price=Decimal("19.99"),
        stock_quantity=50,
        description="First test product"
    )
    return crud_product.create(db_session, obj_in=product_in)

@pytest.fixture
def product_item2(db_session):
    product_in = ProductCreate(
        name="Product Two",
        sku="SKU-PROD2",
        price=Decimal("49.99"),
        stock_quantity=10,
        description="Second test product"
    )
    return crud_product.create(db_session, obj_in=product_in)

@pytest.fixture
def auth_headers_customer1(customer_user1):
    token = create_access_token(subject={"sub": str(customer_user1.id), "role": customer_user1.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_customer2(customer_user2):
    token = create_access_token(subject={"sub": str(customer_user2.id), "role": customer_user2.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_admin(admin_user):
    token = create_access_token(subject={"sub": str(admin_user.id), "role": admin_user.role})
    return {"Authorization": f"Bearer {token}"}

# =========================================================================
# Order Creation (POST /orders/) Endpoint Tests
# =========================================================================

def test_create_order_customer_populates_id(test_client, auth_headers_customer1, customer_user1, product_item1):
    """Verify that when a customer submits an order, customer_id is stored from the authenticated user."""
    payload = {
        "items": [
            {"product_id": product_item1.id, "quantity": 2}
        ]
    }
    response = test_client.post("/api/v1/orders/", json=payload, headers=auth_headers_customer1)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == customer_user1.id
    assert Decimal(data["total_amount"]) == Decimal("39.98")

def test_create_order_customer_ignores_payload_customer_id(test_client, auth_headers_customer1, customer_user1, customer_user2, product_item1):
    """Verify that a customer cannot place an order for another user by injecting customer_id in payload."""
    payload = {
        "customer_id": customer_user2.id, # Inject other customer's ID
        "items": [
            {"product_id": product_item1.id, "quantity": 1}
        ]
    }
    response = test_client.post("/api/v1/orders/", json=payload, headers=auth_headers_customer1)
    assert response.status_code == 201
    data = response.json()
    # It must overwrite and strictly use the authenticated customer's ID
    assert data["customer_id"] == customer_user1.id

def test_create_order_admin_can_specify_customer(test_client, auth_headers_admin, customer_user1, product_item1):
    """Verify that an admin can specify the customer_id for whom the order is created."""
    payload = {
        "customer_id": customer_user1.id,
        "items": [
            {"product_id": product_item1.id, "quantity": 1}
        ]
    }
    response = test_client.post("/api/v1/orders/", json=payload, headers=auth_headers_admin)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == customer_user1.id

def test_create_order_admin_defaults_to_self(test_client, auth_headers_admin, admin_user, product_item1):
    """Verify that if an admin creates an order without specifying a customer_id, it defaults to the admin's ID."""
    payload = {
        "items": [
            {"product_id": product_item1.id, "quantity": 1}
        ]
    }
    response = test_client.post("/api/v1/orders/", json=payload, headers=auth_headers_admin)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == admin_user.id

# =========================================================================
# Order Visibility & Access Rules (GET /orders/{id}) Tests
# =========================================================================

def test_get_order_customer_own_order(test_client, auth_headers_customer1, customer_user1, product_item1, db_session):
    """Verify a customer can successfully retrieve their own order."""
    order_in = OrderCreate(
        customer_id=customer_user1.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    db_order = crud_order.create_order_with_transaction(db_session, obj_in=order_in)

    response = test_client.get(f"/api/v1/orders/{db_order.id}", headers=auth_headers_customer1)
    assert response.status_code == 200
    assert response.json()["id"] == db_order.id

def test_get_order_customer_prevent_other_order(test_client, auth_headers_customer2, customer_user1, product_item1, db_session):
    """Verify a customer is forbidden (403) from retrieving another customer's order."""
    order_in = OrderCreate(
        customer_id=customer_user1.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    db_order = crud_order.create_order_with_transaction(db_session, obj_in=order_in)

    response = test_client.get(f"/api/v1/orders/{db_order.id}", headers=auth_headers_customer2)
    assert response.status_code == 403
    assert "not have enough privileges" in response.json()["detail"]

def test_get_order_admin_can_view_all(test_client, auth_headers_admin, customer_user1, product_item1, db_session):
    """Verify that an admin can view any customer's order."""
    order_in = OrderCreate(
        customer_id=customer_user1.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    db_order = crud_order.create_order_with_transaction(db_session, obj_in=order_in)

    response = test_client.get(f"/api/v1/orders/{db_order.id}", headers=auth_headers_admin)
    assert response.status_code == 200
    assert response.json()["id"] == db_order.id

# =========================================================================
# Order Listing Visibility (GET /orders/) Tests
# =========================================================================

def test_list_orders_customer_views_only_own(test_client, auth_headers_customer1, customer_user1, customer_user2, product_item1, db_session):
    """Verify that a customer's orders list contains ONLY their own orders."""
    order_cust1 = OrderCreate(
        customer_id=customer_user1.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    order_cust2 = OrderCreate(
        customer_id=customer_user2.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    crud_order.create_order_with_transaction(db_session, obj_in=order_cust1)
    crud_order.create_order_with_transaction(db_session, obj_in=order_cust2)

    response = test_client.get("/api/v1/orders/", headers=auth_headers_customer1)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["customer_id"] == customer_user1.id

def test_list_orders_admin_views_all(test_client, auth_headers_admin, customer_user1, customer_user2, product_item1, db_session):
    """Verify that an admin's orders list retrieves all placed orders in the system."""
    order_cust1 = OrderCreate(
        customer_id=customer_user1.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    order_cust2 = OrderCreate(
        customer_id=customer_user2.id,
        items=[OrderItemCreate(product_id=product_item1.id, quantity=1)]
    )
    crud_order.create_order_with_transaction(db_session, obj_in=order_cust1)
    crud_order.create_order_with_transaction(db_session, obj_in=order_cust2)

    response = test_client.get("/api/v1/orders/", headers=auth_headers_admin)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
