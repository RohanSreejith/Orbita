import random
import math

class SupplyChainEnv:
    """
    Simulates a 2-Level Supply Chain:
    Warehouse -> Stores -> Customers
    
    Includes stochastic demand and seasonality.
    """
    def __init__(self, num_stores=1):
        self.num_stores = num_stores
        self.max_stock_store = 50
        self.max_stock_warehouse = 200
        
        # State: [WarehouseStock, Store1Stock, Store2Stock...]
        self.stores_stock = [20 for _ in range(num_stores)]
        self.warehouse_stock = 100
        self.day = 0
        
        # Penalties/Rewards
        self.holding_cost = 0.5
        self.stockout_penalty = 5.0
        self.profit_per_unit = 10.0
        
    def reset(self):
        self.stores_stock = [20 for _ in range(self.num_stores)]
        self.warehouse_stock = 100
        self.day = 0
        return self._get_state()
        
    def _get_demand(self, day):
        # Stochastic Demand with Seasonality (Sine wave + random noise)
        seasonality = max(0, math.sin(day * 0.1) * 5)
        base_demand = 3
        noise = random.randint(-1, 2)
        return max(0, int(base_demand + seasonality + noise))

    def _get_state(self):
        # Flatten state: [WarehouseStock, Store1Stock, Store1DemandForecast...]
        # Simple State: [WarehouseStock, StoreStock] (for single store simplified)
        return {
            "warehouse_stock": self.warehouse_stock,
            "stores_stock": self.stores_stock,
            "day_type": (self.day % 7)  # Day of week
        }

    def step(self, warehouse_action, store_actions):
        """
        Actions are: 
        - warehouse_action: Units to order from Supplier (Infinite capacity)
        - store_actions: List of units to order from Warehouse
        """
        rewards = []
        info = {}
        
        # 1. Warehouse Replenishment (From Supplier)
        # Assume 1-day lead time or instant for simplicity in this MVP
        self.warehouse_stock += warehouse_action
        self.warehouse_stock = min(self.warehouse_stock, self.max_stock_warehouse)
        
        real_demand = self._get_demand(self.day)
        
        # 2. Stores Replenishment (From Warehouse)
        total_requested = sum(store_actions)
        
        # Can Warehouse fulfill?
        fulfilled_ratio = 1.0
        if total_requested > self.warehouse_stock:
            fulfilled_ratio = self.warehouse_stock / total_requested if total_requested > 0 else 0
            
        # Distribute to stores
        for i, order in enumerate(store_actions):
            received = int(order * fulfilled_ratio)
            self.warehouse_stock -= received
            self.stores_stock[i] += received
            self.stores_stock[i] = min(self.stores_stock[i], self.max_stock_store)
            
            # 3. Customer Demand at Store
            sales = min(self.stores_stock[i], real_demand)
            missed_sales = real_demand - sales
            
            self.stores_stock[i] -= sales
            
            # Reward Calculation: Profit - Holding - Penalty
            reward = (sales * self.profit_per_unit) - \
                     (self.stores_stock[i] * self.holding_cost) - \
                     (missed_sales * self.stockout_penalty)
            
            rewards.append(reward)
            
        # Warehouse Reward (Simpler: Keep stock but not too much)
        # Penalty for low stock (risk) and high stock (holding)
        warehouse_holding = self.warehouse_stock * 0.2
        warehouse_reward = -warehouse_holding
        
        self.day += 1
        return self._get_state(), rewards, warehouse_reward, {"demand": real_demand}
