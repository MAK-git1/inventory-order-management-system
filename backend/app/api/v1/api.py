# backend/app/api/v1/api.py
# Purpose: Master router for API Version 1. Registers sub-routers for individual feature modules.

from fastapi import APIRouter
from app.api.v1.endpoints import products, customers, orders, auth, profile, dashboard

api_router = APIRouter()

# Register sub-routers under dedicated endpoints paths
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
