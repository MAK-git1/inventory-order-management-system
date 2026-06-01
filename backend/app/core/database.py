# backend/app/core/database.py
# Purpose: Initialize SQLAlchemy engine connection pool and thread-safe session manager.
# Tailored specifically for Neon Serverless PostgreSQL instances.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Setup engine with connection pool parameters optimized for Neon/PostgreSQL, 
# or standard fallback parameters for SQLite:
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300
    )

# Declarative thread-safe session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for declarative SQLAlchemy models
Base = declarative_base()

def get_db():
    """FastAPI Dependency yielding a thread-safe database session.
    Automatically closes the connection at the end of the request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
