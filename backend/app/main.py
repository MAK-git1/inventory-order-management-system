# backend/app/main.py
# Purpose: Core entrypoint for FastAPI application. Sets up middlewares, routing, and CORS validations.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import Base, engine
import app.models.base  # Register all models for metadata creation

# Automatically create tables in local SQLite or remote Postgres on application startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Inventory & Order Management System",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Configure CORS (Cross-Origin Resource Sharing) production filters
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Safe default if no origins are registered explicitly (avoids wildcard runtime error with credentials)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Include master API Router mapping endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["status"])
def read_root():
    """Service status check endpoint."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "api_v1_docs": "/docs" if settings.ENVIRONMENT != "production" else "disabled_in_production"
    }
