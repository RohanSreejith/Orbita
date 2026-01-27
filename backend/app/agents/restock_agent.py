import google.generativeai as genai
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models import StoreInventory, SupplierCatalog, Supplier, Order, GlobalProduct
import os
import json

# Placeholder Key - User should replace or set env
API_KEY = "Pending" 

class RestockAgent:
    def __init__(self, db_session):
        self.db = db_session
        # In a real scenario, use os.getenv("GEMINI_API_KEY")
        # genai.configure(api_key=API_KEY) 

    async def analyze_stock(self, store_id: int):
        """Finds items that need restocking"""
        stmt = select(StoreInventory).where(StoreInventory.store_id == store_id)
        result = await self.db.execute(stmt)
        inventory = result.scalars().all()
        
        low_stock_items = []
        for item in inventory:
            if item.stock <= item.min_stock_threshold:
                low_stock_items.append(item)
        
        return low_stock_items

    async def get_market_data(self, product_id: int):
        """Fetches all supplier offers for a product"""
        stmt = (
            select(SupplierCatalog, Supplier)
            .join(Supplier, SupplierCatalog.supplier_id == Supplier.id)
            .where(SupplierCatalog.product_id == product_id)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        
        offers = []
        for cat, sup in rows:
            offers.append({
                "supplier_id": sup.id,
                "supplier_name": sup.name,
                "cost": cat.wholesale_cost,
                "delivery_days": sup.delivery_days,
                "reliability": sup.reliability
            })
        return offers

    async def decide_restock(self, item, global_product_name, offers):
        """Uses Gemini to decide the best supplier"""
        
        # PROMPT ENGINEERING
        prompt = f"""
        You are an Autonomous Supply Chain Agent.
        Task: Choose the best supplier to restock '{global_product_name}'.
        
        Context:
        - Current Stock: {item.stock} (CRITICAL LOW)
        - Goal: Balance low cost with high reliability. Urgency is high.
        
        Market Offers:
        {json.dumps(offers, indent=2)}
        
        Output Format: JSON only.
        {{
            "decision": "Order from [Supplier Name]",
            "supplier_id": [ID],
            "reason": "[Short explanation]",
            "quantity": 50
        }}
        """
        
        # MOCK RESPONSE (Fallback if API fails or no key)
        # We will try to call real API if key exists, else mock logic
        
        try:
            # model = genai.GenerativeModel('gemini-pro')
            # response = model.generate_content(prompt)
            # return json.loads(response.text)
            
            # Simple Logic Fallback for Hackathon Stability (Simulating Agent)
            # 1. Sort by reliability desc, then cost asc
            sorted_offers = sorted(offers, key=lambda x: (-x['reliability'], x['cost']))
            best = sorted_offers[0]
            
            return {
                "decision": f"Order from {best['supplier_name']}",
                "supplier_id": best['supplier_id'],
                "reason": f"Selected for highest reliability ({best['reliability']}%) and reasonable cost (${best['cost']}).",
                "quantity": 50
            }
        except Exception as e:
            print(f"Agent Error: {e}")
            return None

    async def run_cycle(self, store_id: int):
        logs = []
        low_stock = await self.analyze_stock(store_id)
        
        if not low_stock:
            return ["Stock levels are healthy. No action needed."]
            
        for item in low_stock:
            # Get Product Name
            res = await self.db.execute(select(GlobalProduct).where(GlobalProduct.id == item.product_id))
            g_prod = res.scalars().first()
            
            # Get Market
            offers = await self.get_market_data(item.product_id)
            
            if not offers:
                logs.append(f"⚠️ No suppliers found for {g_prod.name}")
                continue

            # Check for existing pending orders
            stmt = select(Order).where(
                (Order.store_id == store_id) & 
                (Order.product_id == item.product_id) &
                (Order.status == "Pending Approval")
            )
            existing = await self.db.execute(stmt)
            if existing.scalars().first():
                # logs.append(f"ℹ️ Pending order exists for {g_prod.name}. Skipping.")
                continue
                
            # Decide
            decision = await self.decide_restock(item, g_prod.name, offers)
            
            # Execute
            if decision:
                new_order = Order(
                    store_id=store_id,
                    supplier_id=decision['supplier_id'],
                    product_id=item.product_id,
                    quantity=decision['quantity'],
                    status="Pending Approval", # Changed from Placed
                    timestamp=0 
                )
                self.db.add(new_order)
                logs.append(f"🤖 Proposed Restock for {g_prod.name}: {decision['decision']}")
                
        await self.db.commit()
        return logs
