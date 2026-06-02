# backend/app/tests/test_profile.py
# Purpose: Comprehensive integration tests for GET /profile and PUT /profile endpoints.

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.crud.customer import customer as crud_customer
from app.schemas.customer import CustomerSignUp
from app.core.security import create_access_token

# Setup a clean, independent SQLite file for integration testing
TEST_DB_FILE = "./test.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override for database session injection using the SQLite testing database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module", autouse=True)
def override_database_dependency():
    """Dynamically override get_db dependency for the duration of this test module."""
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Create all tables in the SQLite test database and clean up afterward."""
    # Ensure any residual test database file is removed
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass
        
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()  # Close active connections so the file lock is released
    
    # Remove the SQLite test database file
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

@pytest.fixture
def db_session():
    """Yield a database session for direct model insertion or validation checks."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_client():
    """FastAPI TestClient instance."""
    return TestClient(app)

@pytest.fixture
def customer_user(db_session):
    """Fixture creating a test customer user and returning its database object."""
    # Clear any existing customers to isolate tests
    db_session.query(crud_customer.model).delete()
    db_session.commit()

    signup_in = CustomerSignUp(
        name="Test Customer",
        email="test.customer@example.com",
        phone="+1-555-0100",
        password="secretpassword123"
    )
    user = crud_customer.create_with_password(db_session, obj_in=signup_in)
    return user

@pytest.fixture
def auth_headers(customer_user):
    """Generate JWT auth headers for the created customer_user."""
    token = create_access_token(subject={"sub": str(customer_user.id), "role": customer_user.role})
    return {"Authorization": f"Bearer {token}"}

# =========================================================================
# GET /profile Endpoint Tests
# =========================================================================

def test_get_profile_unauthorized(test_client):
    """Verify GET /profile fails with a 401 response if no Authorization header is provided."""
    response = test_client.get("/api/v1/profile/")
    assert response.status_code == 401
    assert "detail" in response.json()

def test_get_profile_success(test_client, auth_headers, customer_user):
    """Verify GET /profile successfully retrieves current user profile metadata."""
    response = test_client.get("/api/v1/profile/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == customer_user.id
    assert data["name"] == "Test Customer"
    assert data["email"] == "test.customer@example.com"
    assert data["phone"] == "+1-555-0100"
    assert data["role"] == "customer"
    assert "password" not in data
    assert "hashed_password" not in data

# =========================================================================
# PUT /profile Endpoint Tests
# =========================================================================

def test_update_profile_unauthorized(test_client):
    """Verify PUT /profile fails with a 401 response if no token is provided."""
    response = test_client.put(
        "/api/v1/profile/",
        json={"name": "New Name"}
    )
    assert response.status_code == 401

def test_update_profile_all_fields(test_client, auth_headers, customer_user, db_session):
    """Verify PUT /profile successfully updates name, email, phone, and password."""
    update_payload = {
        "name": "Updated Name",
        "email": "updated.email@example.com",
        "phone": "+1-555-0999",
        "password": "newpassword456"
    }
    response = test_client.put(
        "/api/v1/profile/",
        json=update_payload,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    
    # Confirm response returns updated fields and excludes password hashes
    assert data["name"] == "Updated Name"
    assert data["email"] == "updated.email@example.com"
    assert data["phone"] == "+1-555-0999"
    assert "password" not in data
    
    # Refresh user session from db and check updated password verification
    db_session.expire_all()
    user_db = db_session.query(crud_customer.model).filter_by(id=customer_user.id).one()
    assert user_db.name == "Updated Name"
    assert user_db.email == "updated.email@example.com"
    assert user_db.phone == "+1-555-0999"
    
    from app.core.security import verify_password
    assert verify_password("newpassword456", user_db.hashed_password)

def test_update_profile_partial(test_client, auth_headers, customer_user, db_session):
    """Verify PUT /profile supports updating only a single parameter (e.g., name)."""
    # Verify we can perform a partial update of name only
    update_payload = {"name": "Only Name Updated"}
    response = test_client.put(
        "/api/v1/profile/",
        json=update_payload,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Only Name Updated"
    # Other fields should remain unchanged
    assert data["email"] == "test.customer@example.com"
    
    db_session.expire_all()
    user_db = db_session.query(crud_customer.model).filter_by(id=customer_user.id).one()
    assert user_db.name == "Only Name Updated"

def test_update_profile_email_already_in_use(test_client, auth_headers, customer_user, db_session):
    """Verify PUT /profile fails with a 400 response if email is already registered by another customer."""
    # Create another customer in the DB
    other_signup = CustomerSignUp(
        name="Other User",
        email="other.user@example.com",
        phone="+1-555-0222",
        password="anotherpassword999"
    )
    crud_customer.create_with_password(db_session, obj_in=other_signup)
    
    # Attempt to change first customer's email to 'other.user@example.com'
    update_payload = {"email": "other.user@example.com"}
    response = test_client.put(
        "/api/v1/profile/",
        json=update_payload,
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "already in use" in response.json()["detail"]
