from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Store

router = APIRouter()

@router.get("/stores")
async def get_all_stores(db: AsyncSession = Depends(get_db)):
    stmt = select(Store)
    result = await db.execute(stmt)
    stores = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "location": s.location
        }
        for s in stores
    ]
