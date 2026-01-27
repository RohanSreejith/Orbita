from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import Sale, StoreInventory
import datetime

router = APIRouter()

@router.get("/analytics/dashboard")
async def get_analytics_dashboard(store_id: int = 1, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Real Sales for this Store with Price
    query = (
        select(Sale, StoreInventory)
        .join(StoreInventory, Sale.store_inventory_id == StoreInventory.id)
        .where(StoreInventory.store_id == store_id)
    )
    result = await db.execute(query)
    rows = result.all()
    
    # Bucket by Day of Week
    today = datetime.datetime.now()
    
    # Map of weekday_int (0=Mon) -> {sales: 0, demand: 0}
    days_map = {i: {"sales": 0.0, "demand": 0} for i in range(7)}
    
    for sale, inv in rows:
        dt = datetime.datetime.fromtimestamp(sale.timestamp)
        revenue = sale.quantity * inv.price
        days_map[dt.weekday()]["sales"] += revenue
        
    days_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # Convert to List
    final_data = []
    for i in range(7):
        sales_val = days_map[i]["sales"]
        
        # Forecast Algorithm (Simple)
        # Demand is roughly correlated to sales but fluctuates
        base_demand = sales_val * 1.1 + 500 # Base offset so graph isn't empty if 0 sales
        if i >= 5: # Sat/Sun
             base_demand *= 1.3
        
        final_data.append({
            "name": days_labels[i],
            "sales": round(sales_val, 2),
            "demand": int(base_demand)
        })
        
    return final_data
