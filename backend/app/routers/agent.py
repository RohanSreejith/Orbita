from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..agents.restock_agent import RestockAgent
from ..agents.hierarchical_agents import MultiAgentOrchestrator
from ..models import Order, GlobalProduct, Supplier, SupplierCatalog

router = APIRouter()

@router.post("/agent/run-restock")
async def run_restock_agent(store_id: int = 1, db: AsyncSession = Depends(get_db)):
    agent = RestockAgent(db)
    logs = await agent.run_cycle(store_id)
    return {"logs": logs}

@router.post("/agent/run-hierarchical")
async def run_hierarchical_agent(store_id: int = 1, db: AsyncSession = Depends(get_db)):
    orchestrator = MultiAgentOrchestrator(db)
    result = await orchestrator.run_replenishment_cycle(store_id)
    return result # Returns { "logs": [], "interactions": [] }

@router.get("/agent/notifications")
async def get_notifications(store_id: int = 1, db: AsyncSession = Depends(get_db)):
    # Get Orders with "Pending Approval" + Cost Info via Catalog
    stmt = (
        select(Order, GlobalProduct, Supplier, SupplierCatalog)
        .join(GlobalProduct, Order.product_id == GlobalProduct.id)
        .join(Supplier, Order.supplier_id == Supplier.id)
        .join(SupplierCatalog, (Order.product_id == SupplierCatalog.product_id) & (Order.supplier_id == SupplierCatalog.supplier_id))
        .where(Order.store_id == store_id)
        .where(Order.status == "Pending Approval")
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    notifications = []
    for order, prod, sup, cat in rows:
        total_cost = order.quantity * cat.wholesale_cost
        notifications.append({
            "order_id": order.id,
            "product_name": prod.name,
            "supplier_name": sup.name,
            "quantity": order.quantity,
            "cost": total_cost,
            "timestamp": order.timestamp
        })
    return notifications

@router.post("/agent/approve/{order_id}")
async def approve_order(order_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "Placed"
    await db.commit()
    return {"status": "success", "message": f"Order #{order_id} Approved"}

@router.post("/agent/reject/{order_id}")
async def reject_order(order_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Order).where(Order.id == order_id)
    result = await db.execute(stmt)
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "Rejected"
    await db.commit()
    return {"status": "success", "message": f"Order #{order_id} Rejected"}
