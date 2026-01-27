from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel

from ..database import get_db
from ..models import StoreInventory, GlobalProduct

router = APIRouter()

class ProductSchema(BaseModel):
    id: int # store_inventory_id
    product_id: int = 0 # Global ID (Added default for safety)
    name: str # from global
    category: str # from global
    price: float
    stock: int
    image_url: str # from global
    min_stock_threshold: int

    class Config:
        orm_mode = True

@router.get("/products", response_model=List[ProductSchema])
async def get_products(store_id: int = 1, db: AsyncSession = Depends(get_db)):
    # Query Inventory + Global Product details
    query = (
        select(StoreInventory, GlobalProduct)
        .join(GlobalProduct, StoreInventory.product_id == GlobalProduct.id)
        .where(StoreInventory.store_id == store_id)
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Map to schema
    output = []
    for inv, glob in rows:
        output.append({
            "id": inv.id, 
            "product_id": glob.id, # Added for linking
            "name": glob.name,
            "category": glob.category,
            "price": inv.price,
            "stock": inv.stock,
            "image_url": glob.image_url,
            "min_stock_threshold": inv.min_stock_threshold
        })
        
    return output

# --- Customer Endpoints ---

@router.get("/products/global")
async def get_global_catalog(db: AsyncSession = Depends(get_db)):
    # Return unique items for the "Search" page
    result = await db.execute(select(GlobalProduct))
    return result.scalars().all()

from ..models import Store, StoreInventory, Review, Order, Supplier
from sqlalchemy import func
import time

class ReviewSchema(BaseModel):
    user_name: str
    store_id: int
    rating: int
    comment: str

@router.post("/products/{product_id}/reviews")
async def add_review(product_id: int, review: ReviewSchema, db: AsyncSession = Depends(get_db)):
    new_review = Review(
        product_id=product_id,
        store_id=review.store_id,
        user_name=review.user_name,
        rating=review.rating,
        comment=review.comment,
        timestamp=time.time()
    )
    db.add(new_review)
    
    # 4. FEEDBACK LOOP: Update Supplier Reliability based on Product Score
    # Find who we bought this item from most recently
    stmt = (
        select(Order)
        .where(
            (Order.store_id == review.store_id) & 
            (Order.product_id == product_id)
        )
        .order_by(Order.timestamp.desc())
        .limit(1)
    )
    res = await db.execute(stmt)
    last_order = res.scalars().first()
    
    if last_order:
        # Get Supplier
        sup_res = await db.execute(select(Supplier).where(Supplier.id == last_order.supplier_id))
        supplier = sup_res.scalars().first()
        
        if supplier:
            # Algorithm: Weighted impact (5% weight to single review to avoid volatility)
            # Map 1-5 Stars -> 0-100 Score
            # 5=100, 4=80, 3=60, 2=40, 1=20
            review_score = review.rating * 20 
            
            # Apply Impact
            new_reliability = (supplier.reliability * 0.95) + (review_score * 0.05)
            supplier.reliability = int(new_reliability)
            
            # Clamp 0-100
            supplier.reliability = max(0, min(100, supplier.reliability))
            
            print(f"📉 Feedback Loop: User rated {review.rating} stars. {supplier.name} reliability moved to {supplier.reliability}%")
            
    await db.commit()
    return {"status": "success", "message": "Review recorded & Supplier Score Updated"}

@router.get("/products/global/{product_id}")
async def get_product_details(product_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get Product Info
    res = await db.execute(select(GlobalProduct).where(GlobalProduct.id == product_id))
    product = res.scalars().first()
    if not product:
        return {"error": "Not Found"}

    # 2. Get Availability across All Stores
    query = (
        select(StoreInventory, Store)
        .join(Store, StoreInventory.store_id == Store.id)
        .where(StoreInventory.product_id == product_id)
    )
    res = await db.execute(query)
    inventory_rows = res.all()
    
    # 3. Get Reviews (Optimized: Fetch all for product, then filter in memory or join)
    res_reviews = await db.execute(select(Review).where(Review.product_id == product_id))
    all_reviews = res_reviews.scalars().all()
    
    availability = []
    for inv, store in inventory_rows:
        # Filter reviews for this store
        store_reviews = [r for r in all_reviews if r.store_id == store.id]
        avg_rating = sum([r.rating for r in store_reviews]) / len(store_reviews) if store_reviews else 0
        
        availability.append({
            "store_id": store.id,
            "store_name": store.name,
            "location": store.location,
            "price": inv.price,
            "stock": inv.stock,
            "rating": round(avg_rating, 1),
            "reviews": [{"user": r.user_name, "stars": r.rating, "comment": r.comment, "date": r.timestamp} for r in store_reviews]
        })

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "image_url": product.image_url,
        "category": product.category,
        "availability": availability
    }
