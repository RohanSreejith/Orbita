import asyncio
from app.agents.rl_model import QLearningAgent
import random
import numpy as np

# Simulation Constants
DAYS = 1000
ACTIONS = [0, 20, 50, 100]  # Restock quantities
MAX_CAPACITY = 200

def get_state(stock, sales_velocity):
    """
    Discretize state:
    - Stock: Very Low (0), Low (1), Medium (2), High (3)
    - Velocity: Slow (0), Fast (1)
    """
    if stock <= 10: stock_state = 0
    elif stock <= 50: stock_state = 1
    elif stock <= 100: stock_state = 2
    else: stock_state = 3
    
    vel_state = 1 if sales_velocity > 5 else 0
    
    return (stock_state, vel_state)

def run_simulation():
    print("Starting RL Training...")
    agent = QLearningAgent(actions=ACTIONS)
    
    # Initial Conditions
    stock = 100
    sales_velocity = 8 # items per day
    
    total_reward = 0
    
    for day in range(DAYS):
        # 1. State
        state = get_state(stock, sales_velocity)
        
        # 2. Action (Restock)
        restock_qty = agent.choose_action(state)
        
        # Apply Restock (simplified delivery same day for training)
        stock += restock_qty
        if stock > MAX_CAPACITY:
            stock = MAX_CAPACITY # Cap
            
        # 3. Environment Reaction (Sales)
        # Random fluctuation in demand
        daily_demand = max(0, int(np.random.normal(sales_velocity, 2)))
        sold = min(stock, daily_demand)
        stock -= sold
        
        # 4. Reward Calculation
        # Profit per item: $5
        # Holding cost per item: $0.10
        # Restock cost (shipping): $10 per order (flat) if qty > 0
        
        reward = (sold * 5) - (stock * 0.10)
        if restock_qty > 0:
            reward -= 10
            
        # Penalty for missed sales (Stockout)
        missed_sales = daily_demand - sold
        reward -= (missed_sales * 10) # Big penalty
        
        total_reward += reward
        
        # 5. Next State & Learn
        next_state = get_state(stock, sales_velocity)
        agent.learn(state, restock_qty, reward, next_state)
        
        if day % 100 == 0:
            print(f"Day {day}: Level={stock}, Action={restock_qty}, Reward={reward:.2f}")

    print(f"Training Complete. Total Reward: {total_reward}")
    agent.save_model("app/agents/q_table.pkl")

if __name__ == "__main__":
    run_simulation()
