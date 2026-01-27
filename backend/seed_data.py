import asyncio
from app.database import engine, Base, AsyncSessionLocal
from app.models import Product, Supplier
from sqlalchemy.future import select

# Realistic Data with working Unsplash Images
INITIAL_SUPPLIERS = [
    {"name": "Fresh Farms Inc", "reliability": 98, "delivery_days": 1},
    {"name": "Global Imports Ltd", "reliability": 85, "delivery_days": 3},
    {"name": "EcoDairy Co", "reliability": 95, "delivery_days": 1},
    {"name": "Bakery best", "reliability": 92, "delivery_days": 1},
]

INITIAL_PRODUCTS = [
    # Fruits & Veg
    {"name": "Honeycrisp Apples", "category": "Produce", "price": 1.50, "stock": 100, "supplier_index": 0, "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6"},
    {"name": "Organic Bananas", "category": "Produce", "price": 0.60, "stock": 150, "supplier_index": 0, "image_url": "https://images.unsplash.com/photo-1603833665858-e61d17a86224"},
    {"name": "Avocados (Firm)", "category": "Produce", "price": 2.10, "stock": 40, "supplier_index": 1, "image_url": "https://images.unsplash.com/photo-1523049673856-428689c8ae89"},
    {"name": "Red Bell Peppers", "category": "Produce", "price": 1.25, "stock": 60, "supplier_index": 0, "image_url": "https://images.unsplash.com/photo-1563565375-f3fdf5d6c97c"},
    
    # Dairy
    {"name": "Whole Milk (1 Gallon)", "category": "Dairy", "price": 3.99, "stock": 25, "supplier_index": 2, "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b"},
    {"name": "Greek Yogurt", "category": "Dairy", "price": 1.20, "stock": 40, "supplier_index": 2, "image_url": "https://images.unsplash.com/photo-1488477181946-b42318e00906"},
    {"name": "Cheddar Cheese Block", "category": "Dairy", "price": 4.50, "stock": 30, "supplier_index": 2, "image_url": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"},

    # Bakery
    {"name": "Sourdough Loaf", "category": "Bakery", "price": 4.00, "stock": 15, "supplier_index": 3, "image_url": "https://images.unsplash.com/photo-1585478402431-7e1086bced25"},
    {"name": "Croissants (4-Pack)", "category": "Bakery", "price": 5.50, "stock": 12, "supplier_index": 3, "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a"},

    # Essentials
    {"name": "Olive Oil (Extra Virgin)", "category": "Pantry", "price": 12.99, "stock": 20, "supplier_index": 1, "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd4a6c"},
    {"name": "Ground Coffee (Dark)", "category": "Pantry", "price": 8.99, "stock": 35, "supplier_index": 1, "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e"},
    
    # Weather Related
    {"name": "Compact Umbrella", "category": "Accessories", "price": 14.99, "stock": 10, "supplier_index": 1, "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2"},
    {"name": " sunscreen SPF 50", "category": "Personal Care", "price": 9.50, "stock": 15, "supplier_index": 1, "image_url": "https://images.unsplash.com/photo-1526947425960-945c6e72858f"},
]

async def seed():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    print("Seeding data...")
    async with AsyncSessionLocal() as session:
        # Create Suppliers
        suppliers = []
        for s_data in INITIAL_SUPPLIERS:
            supplier = Supplier(**s_data)
            session.add(supplier)
            suppliers.append(supplier)
        
        await session.commit()
        
        # Reload suppliers to get IDs
        # (In a real app we'd fetch them back, but here we assume sequential ID assignment 1..4)
        
        # Create Products
        for p_data in INITIAL_PRODUCTS:
            s_idx = p_data.pop("supplier_index")
            product = Product(**p_data, supplier_id=s_idx + 1) # simple mapping
            session.add(product)
        
        await session.commit()
    
    print("Database seeded successfully! 🌱")

if __name__ == "__main__":
    asyncio.run(seed())
