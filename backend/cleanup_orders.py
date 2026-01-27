import asyncio
from app.database import AsyncSessionLocal, init_db
from app.models import Order
from sqlalchemy import select, delete

async def clean_duplicates():
    async with AsyncSessionLocal() as db:
        print("Checking for Pending Approval orders...")
        result = await db.execute(select(Order).where(Order.status == "Pending Approval"))
        orders = result.scalars().all()
        
        seen = set()
        duplicates = []
        
        print(f"Found {len(orders)} pending orders.")
        
        for order in orders:
            key = (order.store_id, order.product_id)
            if key in seen:
                duplicates.append(order)
            else:
                seen.add(key)
                
        if duplicates:
            print(f"Found {len(duplicates)} duplicates. Removing...")
            for dup in duplicates:
                print(f"Deleting duplicate Order ID: {dup.id} for Product ID: {dup.product_id}")
                await db.delete(dup)
            await db.commit()
            print("Cleanup complete.")
        else:
            print("No duplicates found.")

if __name__ == "__main__":
    asyncio.run(clean_duplicates())
