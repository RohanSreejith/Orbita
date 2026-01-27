from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Store

router = APIRouter()

@router.get("/stores")
async def get_all_stores(db: AsyncSession = Depends(get_db)):
    stmt = select(Store)
    result = await db.execute(stmt)
    stores = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "location": s.location
        }
        for s in stores
    ]

# --- Manual Restock ---
from pydantic import BaseModel

class ManualOrder(BaseModel):
    store_id: int
    product_id: int
    supplier_id: int
    quantity: int

@router.post("/retailers/orders")
async def create_manual_order(order: ManualOrder, db: AsyncSession = Depends(get_db)):
    from ..models import Order
    import time
    
    new_order = Order(
        store_id=order.store_id,
        supplier_id=order.supplier_id,
        product_id=order.product_id,
        quantity=order.quantity,
        status="Placed", # Manual orders are auto-approved
        timestamp=time.time()
    )
    db.add(new_order)
    await db.commit()
    
    return {"status": "success", "order_id": new_order.id}
