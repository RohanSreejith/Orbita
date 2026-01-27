import asyncio
from app.database import AsyncSessionLocal
from app.models import Order
from sqlalchemy.future import select
import logging

logging.basicConfig(level=logging.ERROR)
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)
async def inspect():
    with open("orders.txt", "w") as f:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Order))
            orders = result.scalars().all()
            f.write(f"Found {len(orders)} orders.\n")
            for o in orders:
                f.write(f"Order #{o.id}: Prod={o.product_id}, Sup={o.supplier_id}, Status='{o.status}', Qty={o.quantity}\n")
    print("Done.")

if __name__ == "__main__":
    asyncio.run(inspect())
