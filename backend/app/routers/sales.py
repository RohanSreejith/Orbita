from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import StoreInventory, Sale, Store
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SaleItem(BaseModel):
    product_id: int
    quantity: int

class SaleRequest(BaseModel):
    store_id: int
    items: List[SaleItem]

@router.post("/sales")
async def create_sale(request: SaleRequest, db: AsyncSession = Depends(get_db)):
    # Verify Store exists
    store = await db.get(Store, request.store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    for item in request.items:
        # Find Inventory Item (Store + Global Product)
        stmt = select(StoreInventory).where(
            (StoreInventory.store_id == request.store_id) &
            (StoreInventory.product_id == item.product_id)
        )
        result = await db.execute(stmt)
        inventory_item = result.scalars().first()

        if not inventory_item:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found in store")

        if inventory_item.stock < item.quantity:
             raise HTTPException(status_code=400, detail=f"Insufficient stock for Product {item.product_id}")

        # Decrement Stock
        inventory_item.stock -= item.quantity

        # Record Sale
        new_sale = Sale(
            store_inventory_id=inventory_item.id,
            quantity=item.quantity,
            timestamp=0 # TODO: use real timestamp or datetime
        )
        db.add(new_sale)

    await db.commit()
    return {"status": "success", "message": "Purchase successful"}
