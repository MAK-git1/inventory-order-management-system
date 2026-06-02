# backend/app/api/v1/endpoints/orders.py
# Purpose: FastAPI routes handling order placements, listings, and summary details.
# Enriched with advanced OpenAPI/Swagger documentation metadata for professional /docs exposure.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud.order import order as crud_order
from app.schemas.order import OrderCreate, OrderResponse
from app.models.customer import Customer

router = APIRouter()

@router.post(
    "/", 
    response_model=OrderResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new purchase order",
    description=(
        "Submits a new order transaction containing multiple products. "
        "Performs atomic operations inside a single database transaction block: "
        "verifies the customer exists, checks stock levels for each item, locks matching rows, "
        "and automatically deducts stock on success. Rolled back if stock is insufficient."
    ),
    responses={
        status.HTTP_201_CREATED: {
            "description": "Order submitted and processed successfully."
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Insufficient inventory stock levels detected for one or more requested products."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Target customer or target product IDs could not be found."
        }
    }
)
def create_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: OrderCreate,
    current_user: Customer = Depends(deps.get_current_customer)
) -> OrderResponse:
    # Store customer_id from authenticated user
    if current_user.role != "admin":
        order_in.customer_id = current_user.id
    elif order_in.customer_id is None:
        order_in.customer_id = current_user.id
        
    return crud_order.create_order_with_transaction(db=db, obj_in=order_in)

@router.get(
    "/{id}", 
    response_model=OrderResponse,
    summary="Retrieve an order by ID",
    description="Fetches transactional details of an order, including individual purchased line items and cost totals.",
    responses={
        status.HTTP_200_OK: {
            "description": "Order records fetched successfully."
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "The order with the specified ID was not found."
        }
    }
)
def read_order(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Customer = Depends(deps.get_current_user)
) -> OrderResponse:
    order_record = crud_order.get(db=db, id=id)
    if not order_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )
    # Check ownership
    if current_user.role != "admin" and order_record.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges."
        )
    return order_record

@router.get(
    "/", 
    response_model=list[OrderResponse],
    summary="List all orders",
    description="Fetches multiple order history logs supporting pagination offsets and limits."
)
def read_orders(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Customer = Depends(deps.get_current_user)
) -> list[OrderResponse]:
    if current_user.role == "admin":
        return crud_order.get_multi(db=db, skip=skip, limit=limit)
    else:
        return crud_order.get_by_customer(db=db, customer_id=current_user.id, skip=skip, limit=limit)
