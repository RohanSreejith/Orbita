from .environment import SupplyChainEnv
from .agents import QLearningAgent, CoordinatorAgent
import numpy as np

# Global Singleton for the "Training Session"
# In a real production system, this would be a persistent service or DB-backed.
class RLOrchestrator:
    def __init__(self):
        self.env = SupplyChainEnv(num_stores=1)
        # Action Space: Units to order [0, 10, 20, 30, 40, 50, 60...]
        self.action_space_store = [0, 5, 10, 15, 20, 30]
        self.action_space_warehouse = [0, 20, 50, 100, 150]
        
        self.store_agent = QLearningAgent(self.action_space_store, alpha=0.1, gamma=0.9, epsilon=0.1)
        self.warehouse_agent = QLearningAgent(self.action_space_warehouse, alpha=0.1, gamma=0.9, epsilon=0.1)
        self.coordinator = CoordinatorAgent()
        
        self.trained_episodes = 0
        
    def train(self, episodes=500):
        total_rewards = []
        for ep in range(episodes):
            state = self.env.reset()
            done = False
            ep_reward = 0
            
            for day in range(30): # 30-day episodes
                # 1. Warehouse Action
                # State simplified key formulation
                wh_state_key = (state['warehouse_stock'], state['day_type'])
                wh_action_idx = self.warehouse_agent.choose_action(wh_state_key)
                wh_action = self.action_space_warehouse[wh_action_idx]
                
                # 2. Store Action
                # Store gets observation: [MyStock, Day]
                # Assuming single store for now
                store_state_key = (state['stores_stock'][0], state['day_type'])
                st_action_idx = self.store_agent.choose_action(store_state_key)
                st_action = self.action_space_store[st_action_idx]
                
                # 3. Environment Step
                next_state, rewards, warehouse_reward, info = self.env.step(wh_action, [st_action])
                
                # 4. Learning Update
                
                # Store Update
                store_reward = rewards[0]
                next_store_state_key = (next_state['stores_stock'][0], next_state['day_type'])
                self.store_agent.learn(store_state_key, st_action_idx, store_reward, next_store_state_key)
                
                # Warehouse Update
                next_wh_state_key = (next_state['warehouse_stock'], next_state['day_type'])
                self.warehouse_agent.learn(wh_state_key, wh_action_idx, warehouse_reward, next_wh_state_key)
                
                state = next_state
                ep_reward += (store_reward + warehouse_reward)
                
            total_rewards.append(ep_reward)
            self.coordinator.monitor(ep_reward)
            
        self.trained_episodes += episodes
        return {"avg_reward": np.mean(total_rewards[-50:]), "episodes": self.trained_episodes}

    def run_simulation_scenario(self, days=15):
        """
        Runs a simulation *without* exploration (exploitation only) to show results.
        Returns daily breakdown.
        """
        # Backup epsilon
        old_eps_s = self.store_agent.epsilon
        old_eps_w = self.warehouse_agent.epsilon
        self.store_agent.epsilon = 0.0
        self.warehouse_agent.epsilon = 0.0
        
        state = self.env.reset()
        history = []
        
        for day in range(days):
            wh_state_key = (state['warehouse_stock'], state['day_type'])
            wh_action_idx = self.warehouse_agent.choose_action(wh_state_key)
            wh_action = self.action_space_warehouse[wh_action_idx]
            
            store_state_key = (state['stores_stock'][0], state['day_type'])
            st_action_idx = self.store_agent.choose_action(store_state_key)
            st_action = self.action_space_store[st_action_idx]
            
            next_state, rewards, warehouse_reward, info = self.env.step(wh_action, [st_action])
            
            history.append({
                "day": day + 1,
                "demand": info['demand'],
                "store_stock_start": state['stores_stock'][0],
                "store_order": st_action,
                "store_stock_end": next_state['stores_stock'][0],
                "warehouse_stock": state['warehouse_stock'],
                "warehouse_replenish": wh_action,
                "sales_reward": rewards[0]
            })
            state = next_state
            
        # Restore epsilon
        self.store_agent.epsilon = old_eps_s
        self.warehouse_agent.epsilon = old_eps_w
        return history

# Instantiate Global Singleton
rl_system = RLOrchestrator()
