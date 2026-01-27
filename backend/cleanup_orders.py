import asyncio
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models import Order

async def clean():
    async with AsyncSessionLocal() as db:
        # Get all pending orders
        stmt = select(Order).where(Order.status == "Pending Approval")
        res = await db.execute(stmt)
        orders = res.scalars().all()
        
        seen = set()
        duplicates = []
        
        print(f"Found {len(orders)} pending orders.")
        
        for o in orders:
            key = (o.store_id, o.product_id, o.supplier_id, o.quantity)
            if key in seen:
                duplicates.append(o.id)
            else:
                seen.add(key)
                
        if duplicates:
            print(f"Deleting {len(duplicates)} duplicates: {duplicates}")
            del_stmt = delete(Order).where(Order.id.in_(duplicates))
            await db.execute(del_stmt)
            await db.commit()
            print("Cleanup complete.")
        else:
            print("No duplicates found.")

if __name__ == "__main__":
    asyncio.run(clean())
