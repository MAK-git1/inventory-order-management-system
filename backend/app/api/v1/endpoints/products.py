# backend/app/api/v1/endpoints/products.py
# Purpose: FastAPI routes handling product listings, creation, retrieval, updates, and removals.
# Enriched with advanced OpenAPI/Swagger documentation metadata for professional /docs exposure.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.product import product as crud_product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.models.customer import Customer

router = APIRouter()

@router.post(
    "/", 
    response_model=ProductResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description=(
        "Registers a new product in the catalog. "
        "Enforces a strict unique constraint on the product SKU parameter."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "description": "Product registered successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "SKU collision detected or parameter validation error."
        }
    }
)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: Customer = Depends(deps.get_current_admin)
) -> ProductResponse:
    existing_product = crud_product.get_by_sku(db, sku=product_in.sku)
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists."
        )
    return crud_product.create(db=db, obj_in=product_in)

@router.get(
    "/{id}", 
    response_model=ProductResponse,
    summary="Retrieve a product by ID",
    description="Fetches a single product record by its database unique ID key.",
    responses={
        status.HTTP_200_OK: {
            "description": "Product details retrieved successfully."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The product with the specified ID was not found."
        }
    }
)
def read_product(
    *,
    db: Session = Depends(deps.get_db),
    id: int
) -> ProductResponse:
    product_record = crud_product.get(db=db, id=id)
    if not product_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return product_record

@router.get(
    "/", 
    response_model=list[ProductResponse],
    summary="List all products",
    description="Fetches multiple product records supporting pagination offsets and limits."
)
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> list[ProductResponse]:
    return crud_product.get_multi(db=db, skip=skip, limit=limit)

@router.put(
    "/{id}", 
    response_model=ProductResponse,
    summary="Update an existing product",
    description=(
        "Updates attributes of a registered product record. "
        "If SKU is modified, verifies the target SKU is not already claimed by another product record."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Product updated successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "SKU collision detected or parameter validation error."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The product with the specified ID was not found."
        }
    }
)
def update_product(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    product_in: ProductUpdate,
    current_user: Customer = Depends(deps.get_current_admin)
) -> ProductResponse:
    product_record = crud_product.get(db=db, id=id)
    if not product_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    
    if product_in.sku and product_in.sku != product_record.sku:
        existing_product = crud_product.get_by_sku(db, sku=product_in.sku)
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists."
            )
            
    return crud_product.update(db=db, db_obj=product_record, obj_in=product_in)

@router.delete(
    "/{id}", 
    response_model=ProductResponse,
    summary="Delete a product",
    description="Removes a product record permanently from the system registry.",
    responses={
        status.HTTP_200_OK: {
            "description": "Product record deleted successfully."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The product with the specified ID was not found."
        }
    }
)
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Customer = Depends(deps.get_current_admin)
) -> ProductResponse:
    product_record = crud_product.get(db=db, id=id)
    if not product_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return crud_product.remove(db=db, id=id)
