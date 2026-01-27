from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Supplier, SupplierCatalog, GlobalProduct

router = APIRouter()

# --- Schemas ---
class SupplierOffer(BaseModel):
    supplier_id: int
    supplier_name: str
    wholesale_cost: float
    delivery_days: int
    reliability: int

class CatalogItem(BaseModel):
    product_name: str
    category: str
    wholesale_cost: float

    wholesale_cost: float

# --- Endpoints ---

@router.get("/suppliers")
async def get_all_suppliers(db: AsyncSession = Depends(get_db)):
    stmt = select(Supplier)
    result = await db.execute(stmt)
    suppliers = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "reliability": s.reliability
        }
        for s in suppliers
    ]

@router.get("/suppliers/{supplier_id}/dashboard")
async def get_supplier_dashboard(supplier_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Supplier Details
    res = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = res.scalars().first()
    if not supplier:
        return {"error": "Supplier not found"}

    # 2. Fetch Catalog
    # Join Catalog -> GlobalProduct
    query = (
        select(SupplierCatalog, GlobalProduct)
        .join(GlobalProduct, SupplierCatalog.product_id == GlobalProduct.id)
        .where(SupplierCatalog.supplier_id == supplier_id)
    )
    res = await db.execute(query)
    rows = res.all()
    
    catalog = []
    for entry, prod in rows:
        catalog.append({
            "product_name": prod.name,
            "category": prod.category,
            "wholesale_cost": entry.wholesale_cost,
            "stock_status": "In Stock" # Mocked for supplier
        })
        
    # 3. Fetch Real Active Orders
    # Join Order -> GlobalProduct, Store
    from ..models import Order, Store
    stmt = (
        select(Order, GlobalProduct, Store)
        .join(GlobalProduct, Order.product_id == GlobalProduct.id)
        .join(Store, Order.store_id == Store.id)
        .where(Order.supplier_id == supplier_id)
        .where(Order.status.in_(["Placed", "Shipped", "Delivered"])) # Only valid orders for supplier
        .order_by(Order.timestamp.desc())
    )
    res = await db.execute(stmt)
    rows = res.all()

    orders_data = []
    for order, prod, store in rows:
        orders_data.append({
            "id": order.id,
            "order_ref": f"ORD-{order.id}",
            "store": store.name,
            "item": prod.name,
            "qty": order.quantity,
            "status": order.status
        })

    return {
        "name": supplier.name,
        "reliability_score": supplier.reliability,
        "catalog": catalog,
        "active_orders": orders_data
    }

class OrderStatusUpdate(BaseModel):
    status: str # "Shipped", "Delivered"

@router.post("/suppliers/orders/{order_id}/status")
async def update_order_status(order_id: int, update: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    from ..models import Order, StoreInventory
    
    # Fetch Order
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalars().first()
    
    if not order:
        return {"error": "Order not found"}
        
    order.status = update.status
    
    # IF Delivered -> Increase Stock
    if update.status == "Delivered":
        # Find Inventory
        stmt = select(StoreInventory).where(
            (StoreInventory.store_id == order.store_id) &
            (StoreInventory.product_id == order.product_id)
        )
        inv_res = await db.execute(stmt)
        inventory = inv_res.scalars().first()
        
        if inventory:
            inventory.stock += order.quantity
            print(f"📦 Stock Restored! Store {order.store_id}, Product {order.product_id}, +{order.quantity}")
            
    await db.commit()
    return {"status": "success", "new_status": update.status}

@router.get("/products/{product_id}/suppliers", response_model=List[SupplierOffer])
async def get_suppliers_for_product(product_id: int, db: AsyncSession = Depends(get_db)):
    # Used by Retailer to compare prices
    # Join SupplierCatalog -> Supplier
    query = (
        select(SupplierCatalog, Supplier)
        .join(Supplier, SupplierCatalog.supplier_id == Supplier.id)
        .where(SupplierCatalog.product_id == product_id)
    )
    
    res = await db.execute(query)
    rows = res.all()
    
    offers = []
    for entry, sup in rows:
        offers.append({
            "supplier_id": sup.id,
            "supplier_name": sup.name,
            "wholesale_cost": entry.wholesale_cost,
            "delivery_days": sup.delivery_days,
            "reliability": sup.reliability
        })
        
    # Sort by price ascending by default
    offers.sort(key=lambda x: x["wholesale_cost"])
    
    return offers
