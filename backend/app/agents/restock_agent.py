import google.generativeai as genai
import time
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
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

    async def get_avg_rating(self, product_id: int):
        """Calculates average rating for a product"""
        from app.models import Review
        
        stmt = select(func.avg(Review.rating)).where(Review.product_id == product_id)
        result = await self.db.execute(stmt)
        avg = result.scalar()
        return avg if avg else 3.0 # Default to neutral 3.0 if no reviews

    async def decide_restock(self, item, global_product_name, offers, avg_rating, retail_price):
        """Uses Logic (or Gemini) to decide restock based on Demand, Price, Rating"""
        
        # 1. Calculate Optimal Quantity
        # Strategy: Target Stock Level based on Demand indicators (Rating) and Cost inhibition (Price)
        # Base Target: Keep 4x the min threshold (buffer for sales)
        base_target = item.min_stock_threshold * 4 
        if base_target < 20: base_target = 20 # Minimum sensible shelf presence
        
        # RATING FACTOR
        rating_notes = []
        rating_mult = 1.0
        if avg_rating >= 4.5:
            rating_mult = 1.5 # High demand item, stock up!
            rating_notes.append("High Rating ⭐")
        elif avg_rating <= 2.5:
            rating_mult = 0.5 # Poor item, minimize stock
            rating_notes.append("Low Rating 📉")
            
        # PRICE FACTOR
        # If item is expensive, we don't want too much capital tied up
        price_mult = 1.0
        if retail_price > 100:
            price_mult = 0.7 # Expensive, lean inventory
            rating_notes.append("High Value Item 💎")
            
        # CALCULATION
        target_stock = int(base_target * rating_mult * price_mult)
        order_qty = target_stock - item.stock
        
        # Sanity Check
        if order_qty < 5: order_qty = 5 # Minimum batch
        if order_qty > 100: order_qty = 100 # Max batch cap
        
        # 2. Select Supplier (Reliability preference)
        # Sort by: (Reliability > 90 preferred), then Cost
        # Heuristic: Score = Reliability - (Cost * 0.5) to balance
        sorted_offers = sorted(offers, key=lambda x: (x['reliability'] * 1 + (1000 - x['cost'])), reverse=True)
        best = sorted_offers[0]
        
        reason = f"Based on {avg_rating:.1f}★ rating. Target: {target_stock} units. " + ", ".join(rating_notes)
        if not rating_notes: reason += "Standard restock."

        return {
            "decision": f"Order {order_qty} from {best['supplier_name']}",
            "supplier_id": best['supplier_id'],
            "reason": reason,
            "quantity": order_qty
        }

    async def run_cycle(self, store_id: int):
        logs = []
        try:
            low_stock = await self.analyze_stock(store_id)
            
            if not low_stock:
                return ["Stock levels are healthy. No action needed."]
                
            for item in low_stock:
                try:
                    # Get Product Global Info
                    res = await self.db.execute(select(GlobalProduct).where(GlobalProduct.id == item.product_id))
                    g_prod = res.scalars().first()
                    
                    if not g_prod:
                        logs.append(f"❌ Error: Product ID {item.product_id} not found in Global Catalog.")
                        continue

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
                        
                    # GATHER SIGNALS
                    avg_rating = await self.get_avg_rating(item.product_id)
                    
                    # Decide
                    decision = await self.decide_restock(item, g_prod.name, offers, avg_rating, item.price)
                    
                    # Execute
                    if decision:
                        new_order = Order(
                            store_id=store_id,
                            supplier_id=decision['supplier_id'],
                            product_id=item.product_id,
                            quantity=decision['quantity'],
                            status="Pending Approval",
                            timestamp=time.time() 
                        )
                        self.db.add(new_order)
                        log_msg = f"🤖 Restock {g_prod.name}: {decision['decision']} ({decision['reason']})"
                        logs.append(log_msg)
                        print(log_msg) # Debug print
                except Exception as inner_e:
                     logs.append(f"❌ Error processing item {item.id}: {str(inner_e)}")
                     print(f"Error processing item {item.id}: {inner_e}")
                    
            await self.db.commit()
            return logs
        except Exception as e:
            await self.db.rollback()
            return [f"🔥 CRITICAL AGENT ERROR: {str(e)}"]
                
        await self.db.commit()
        return logs
