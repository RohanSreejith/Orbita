import random
import numpy as np
from sqlalchemy import select
from app.models import StoreInventory, GlobalProduct, Order
from app.agents.rl_model import QLearningAgent
import os

# --- 1. Demand Forecaster Agent ---
class DemandForecaster:
    """
    Role: Predicts future demand based on sales history and stochastic factors (seasonality, noise).
    Problem Statement Alignment: "Predict demand under stochastic and seasonal conditions"
    """
    def __init__(self, db_session):
        self.db = db_session

    async def predict_demand(self, product_id, current_velocity_7d):
        """
        Returns a demand forecast for the next replenishment cycle.
        """
        # 1. Base Demand (from recent velocity)
        base_demand = current_velocity_7d * 7 # Weekly demand assumption
        
        # 2. Add Stochasticity (Random Noise) - Simulating real-world uncertainty
        noise = np.random.normal(0, 0.1 * base_demand) # +/- 10% drift
        
        # 3. Add Seasonality (Mocked)
        # Randomly assign a "season" factor if not passed
        season_factor = random.choice([0.8, 1.0, 1.2, 1.5]) 
        
        forecast = (base_demand * season_factor) + noise
        
        return max(0, int(forecast)), season_factor

# --- 2. Store Agent (RL Driven) ---
class StoreAgent:
    """
    Role: Optimizes inventory levels at the store level.
    Uses Reinforcement Learning (Q-Learning) to decide order quantities.
    Problem Statement Alignment: "Optimize inventory levels to reduce stockouts"
    """
    def __init__(self, actions=[0, 20, 50, 100]):
        self.rl = QLearningAgent(actions=actions)
        # Load pre-trained model if exists
        model_path = os.path.join(os.path.dirname(__file__), "q_table.pkl")
        self.rl.load_model(model_path)
        
    def decide_order(self, current_stock, predicted_demand):
        """
        State: (Stock Level, Demand Level)
        Action: Order Quantity
        """
        # Discretize State for Q-Table
        stock_state = 0
        if current_stock <= 10: stock_state = 0
        elif current_stock <= 50: stock_state = 1
        elif current_stock <= 100: stock_state = 2
        else: stock_state = 3
        
        demand_level = 0
        if predicted_demand > 50: demand_level = 1 # High Demand
        
        state = (stock_state, demand_level)
        
        # Choose Action (Exploit)
        action = self.rl.choose_action(state, train=False)
        return action

# --- 3. Warehouse Coordinator Agent ---
class WarehouseCoordinator:
    """
    Role: Coordinates supply between suppliers and stores.
    Approves replenishment to ensure global efficiency.
    Problem Statement Alignment: "Enable proactive, distributed decision-making"
    """
    def __init__(self):
        pass
        
    def review_order(self, store_id, product_name, qty):
        # Logic: Check if warehouse has constraints (Mocked)
        # If qty > 100, might need approval or split
        status = "Approved"
        note = "Standard Fulfillment"
        
        if qty > 80:
            note = "Bulk Order - Priority Shipping"
        elif qty == 0:
            status = "Skipped"
            note = "No RESTOCK needed"
            
        return status, note

# --- 4. Orchestrator (The "Framework") ---
class MultiAgentOrchestrator:
    """
    Hierarchical Controller that runs the agent workflow.
    """
    def __init__(self, db_session):
        self.db = db_session
        self.forecaster = DemandForecaster(db_session)
        self.store_agent = StoreAgent()
        self.coordinator = WarehouseCoordinator()
        
    async def run_replenishment_cycle(self, store_id: int):
        logs = []
        interactions = [] # New structured log for UI Neural Link

        # Initial Signal
        interactions.append({
            "from": "retailer",
            "to": "retailer", 
            "content": f"Orchestrator: Starting Daily Inventory Scan for Store #{store_id}",
            "type": "info"
        })
        
        # 1. Get Inventory
        stmt = select(StoreInventory).where(StoreInventory.store_id == store_id)
        result = await self.db.execute(stmt)
        inventory = result.scalars().all()
        
        for item in inventory:
            # Fetch Product Name
            p_res = await self.db.execute(select(GlobalProduct).where(GlobalProduct.id == item.product_id))
            product = p_res.scalars().first()
            
            # --- AGENT 1: Forecaster ---
            # Mock velocity for now (or calc from sales)
            mock_velocity = max(1, item.stock / 10) # Placeholder
            forecast, season = await self.forecaster.predict_demand(item.product_id, mock_velocity)
            
            # --- AGENT 2: Store Agent (RL) ---
            suggested_qty = self.store_agent.decide_order(item.stock, forecast)
            
            if suggested_qty > 0:
                # 1. Forecast Event
                interactions.append({
                    "from": "retailer", # Forecast is internal to retailer/store agent
                    "to": "retailer",
                    "content": f"Forecaster Predicted Demand: {forecast} (Season: {season})",
                    "type": "info"
                })

                # 2. Store Agent Decision
                interactions.append({
                    "from": "retailer",
                    "to": "warehouse",
                    "content": f"Store Agent requesting restock of {suggested_qty} units for {product.name}",
                    "type": "warning"
                })
                
                logs.append(f"📦 Product: {product.name}")
                logs.append(f"   ├─ 🧠 Forecaster: Predicted Demand {forecast} (Seasonality Factor: {season})")
                logs.append(f"   ├─ 🤖 Store Agent (RL): Current Stock {item.stock} -> Suggests Ordering {suggested_qty}")
                
                # --- AGENT 3: Warehouse Coordinator ---
                status, note = self.coordinator.review_order(store_id, product.name, suggested_qty)
                
                # 3. Warehouse Decision
                interactions.append({
                    "from": "warehouse",
                    "to": "supplier",
                    "content": f"Warehouse {status} order for {product.name}. Note: {note}",
                    "type": "success" if status == "Approved" else "error"
                })

                logs.append(f"   └─ 🏢 Warehouse: {status} ({note})")
                
                if status == "Approved":
                    # Create Order
                    new_order = Order(
                        store_id=store_id,
                        # Mock Supplier 1 for simplicity in this demo loop
                        supplier_id=1, 
                        product_id=item.product_id,
                        quantity=suggested_qty,
                        status="Pending Approval",
                        timestamp=0
                    )
                    self.db.add(new_order)
            
        await self.db.commit()
        logs.append("✅ Cycle Complete. Database updated.")
        
        return {
            "logs": logs,
            "interactions": interactions
        }
