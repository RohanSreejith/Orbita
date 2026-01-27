import asyncio
from app.database import AsyncSessionLocal
from app.models import SupplierCatalog
from sqlalchemy.future import select
import logging

logging.basicConfig(level=logging.ERROR)
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)

async def inspect():
    with open("catalog.txt", "w") as f:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(SupplierCatalog))
            items = result.scalars().all()
            f.write(f"Found {len(items)} items.\n")
            for i in items:
                f.write(f"Sup={i.supplier_id}, Prod={i.product_id}, Cost={i.wholesale_cost}\n")
    print("Done.")

if __name__ == "__main__":
    asyncio.run(inspect())
