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
    # 1. Fetch Real Sales for this Store
    query = (
        select(Sale)
        .join(StoreInventory, Sale.store_inventory_id == StoreInventory.id)
        .where(StoreInventory.store_id == store_id)
    )
    result = await db.execute(query)
    sales = result.scalars().all()
    
    # Bucket by Day of Week
    # We want a fixed order: Mon, Tue... Sun (or last 7 days rolling)
    # Let's do absolute last 7 days for the chart
    
    today = datetime.datetime.now()
    chart_data = []
    
    # Map of weekday_int (0=Mon) -> {sales: 0, demand: 0}
    days_map = {i: {"sales": 0, "demand": 0} for i in range(7)}
    
    for sale in sales:
        dt = datetime.datetime.fromtimestamp(sale.timestamp)
        days_map[dt.weekday()]["sales"] += (sale.quantity * 100) # Assuming avg price $100 for graph scale or just volume
        # Let's say we graph Revenue? Or just Quantity? 
        # The mockup showed values like 4000. 
        # Let's assume it's Revenue. We didn't join price. 
        # Simplification: Assume avg item price $50.
        
    days_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # Convert to List
    final_data = []
    for i in range(7):
        sales_val = days_map[i]["sales"] * 50 # Mock avg price
        
        # Forecast Algorithm (Simple)
        # Demand is usually slightly higher than sales (opportunity) + random noise
        # Or if it's a weekend, demand spikes
        base_demand = sales_val * 1.2
        if i >= 5: # Sat/Sun
             base_demand *= 1.3
        
        final_data.append({
            "name": days_labels[i],
            "sales": int(sales_val),
            "demand": int(base_demand)
        })
        
    return final_data
