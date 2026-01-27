import asyncio
from app.database import init_db, AsyncSessionLocal
from app.models import GlobalProduct, Store, StoreInventory, Supplier, SupplierCatalog, Sale
from sqlalchemy.future import select
import random
import time

async def seed():
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(GlobalProduct))
        if result.scalars().first():
            print("Database already seeded.")
            return

        print("Seeding Global Catalog...")
        
        # 1. Global Products
        catalog_items = [
            GlobalProduct(name="Coca Cola", category="Beverages", image_url="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800", description="Classic refreshing cola."),
            GlobalProduct(name="Mineral Water", category="Beverages", image_url="https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=800", description="Pure spring water."),
            GlobalProduct(name="Croissant", category="Bakery", image_url="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800", description="Buttery french pastry."),
            GlobalProduct(name="Umbrella", category="Accessories", image_url="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800", description="Compact windproof umbrella."),
            GlobalProduct(name="Sunscreen", category="Personal Care", image_url="https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800", description="SPF 50 protection."),
            GlobalProduct(name="Apple", category="Produce", image_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800", description="Fresh red apple."),
            GlobalProduct(name="Sandwich", category="Food", image_url="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800", description="Ham and cheese sandwich."),
            GlobalProduct(name="Iced Coffee", category="Beverages", image_url="/iced-coffee.png", description="Cold brew with milk."),
        ]
        session.add_all(catalog_items)
        await session.commit()
        
        # Refresh to get IDs
        # We need to re-fetch or assume order. Let's re-fetch.
        result = await session.execute(select(GlobalProduct))
        products = result.scalars().all()
        
        # 2. Stores
        print("Seeding Stores...")
        store1 = Store(name="Kiosk Alpha", location="Central Station")
        store2 = Store(name="Kiosk Beta", location="City Park")
        session.add_all([store1, store2])
        await session.commit()
        
        # 3. Suppliers
        print("Seeding Suppliers...")
        sup1 = Supplier(name="Global Foods Inc", reliability=98, delivery_days=2)
        sup2 = Supplier(name="Local Farms", reliability=85, delivery_days=1)
        sup3 = Supplier(name="Budget Wholesale", reliability=70, delivery_days=3)
        session.add_all([sup1, sup2, sup3])
        await session.commit()
        
        # 4. Store Inventory
        # Kiosk Alpha has everything
        print("Stocking Kiosk Alpha...")
        for p in products:
            inv = StoreInventory(
                store_id=store1.id,
                product_id=p.id,
                price=5.0 if "Sandwich" in p.name else 2.5,
                stock=random.randint(5, 50),
                min_stock_threshold=10
            )
            session.add(inv)
            
        # Kiosk Beta has only drinks and bakery (Mocking difference)
        print("Stocking Kiosk Beta...")
        for p in products:
            if p.category in ["Beverages", "Bakery", "Produce"]:
                inv = StoreInventory(
                    store_id=store2.id,
                    product_id=p.id,
                    price=4.5 if "Sandwich" in p.name else 2.0, # Cheaper?
                    stock=random.randint(10, 30),
                    min_stock_threshold=10
                )
                session.add(inv)
        
        await session.commit()
        
        # 5. Supplier Catalog (Competition)
        print("Building Supplier Catalogs...")
        suppliers = [sup1, sup2, sup3]
        for p in products:
            # Each supplier might carry it
            for s in suppliers:
                # Random chance they sell it
                if random.random() > 0.2: 
                    base_cost = 1.0
                    if "Sandwich" in p.name: base_cost = 2.5
                    
                    # Variation: Reliable suppliers are expensive, Budget is cheap
                    multiplier = 1.0
                    if s.name == "Global Foods Inc": multiplier = 1.2
                    if s.name == "Budget Wholesale": multiplier = 0.8
                    
                    entry = SupplierCatalog(
                        supplier_id=s.id,
                        product_id=p.id,
                        wholesale_cost=round(base_cost * multiplier, 2)
                    )
                    session.add(entry)
        
        await session.commit()
        
        # 6. Sales History (For Analytics)
        print("Generating Historical Sales...")
        # Get Kiosk Alpha inventory
        result = await session.execute(select(StoreInventory).where(StoreInventory.store_id == store1.id))
        inventory_items = result.scalars().all()
        
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        current_time = time.time()
        
        for i, day in enumerate(days):
            daily_sales_count = random.randint(20, 40)
            day_timestamp = current_time - ((6 - i) * 86400)
            
            for _ in range(daily_sales_count):
                inv = random.choice(inventory_items)
                qty = random.randint(1, 4)
                sale = Sale(store_inventory_id=inv.id, quantity=qty, timestamp=day_timestamp)
                session.add(sale)

        await session.commit()
        print("Database seeded successfully! 🚀")

if __name__ == "__main__":
    asyncio.run(seed())
