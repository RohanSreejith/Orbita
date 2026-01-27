import asyncio
from app.database import init_db, AsyncSessionLocal
from app.models import GlobalProduct
from sqlalchemy import select

async def check():
    await init_db()
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(GlobalProduct))
        count = len(res.scalars().all())
        print(f"GlobalProduct Count: {count}")

if __name__ == "__main__":
    asyncio.run(check())
