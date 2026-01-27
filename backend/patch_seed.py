import asyncio
from app.database import init_db, AsyncSessionLocal
from app.models import Store, Supplier
from sqlalchemy.future import select

async def patch_seed():
    async with AsyncSessionLocal() as session:
        print("Checking Stores...")
        result = await session.execute(select(Store))
        if not result.scalars().first():
            print("Adding Missing Stores...")
            store1 = Store(name="Kiosk Alpha", location="Central Station")
            store2 = Store(name="Kiosk Beta", location="City Park")
            session.add_all([store1, store2])
            await session.commit()
            print("Stores Added.")
        else:
            print("Stores already exist.")

        print("Checking Suppliers...")
        result = await session.execute(select(Supplier))
        if not result.scalars().first():
            print("Adding Missing Suppliers...")
            sup1 = Supplier(name="Global Foods Inc", reliability=98, delivery_days=2)
            sup2 = Supplier(name="Local Farms", reliability=85, delivery_days=1)
            sup3 = Supplier(name="Budget Wholesale", reliability=70, delivery_days=3)
            session.add_all([sup1, sup2, sup3])
            await session.commit()
            print("Suppliers Added.")
        else:
            print("Suppliers already exist.")

if __name__ == "__main__":
    asyncio.run(patch_seed())
