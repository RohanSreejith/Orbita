from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel

from ..database import get_db
from ..models import Product as ProductModel

router = APIRouter()

class ProductSchema(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stock: int
    image_url: str
    min_stock_threshold: int

    class Config:
        orm_mode = True

@router.get("/products", response_model=List[ProductSchema])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductModel))
    products = result.scalars().all()
    return products
