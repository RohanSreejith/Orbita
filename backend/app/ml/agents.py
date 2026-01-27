import random
import numpy as np

class QLearningAgent:
    def __init__(self, action_space, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.q_table = {} # State (str) -> [Q-values]
        self.action_space = action_space # list of possible order quantities e.g. [0, 5, 10, 15]
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        
    def get_q(self, state, action_idx):
        return self.q_table.get(str(state), [0.0]*len(self.action_space))[action_idx]

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.randint(0, len(self.action_space)-1)
        
        # Exploit
        q_values = self.q_table.get(str(state), [0.0]*len(self.action_space))
        return np.argmax(q_values)

    def learn(self, state, action_idx, reward, next_state):
        current_q = self.get_q(state, action_idx)
        
        next_q_values = self.q_table.get(str(next_state), [0.0]*len(self.action_space))
        max_next_q = np.max(next_q_values)
        
        new_q = current_q + self.alpha * (reward + self.gamma * max_next_q - current_q)
        
        # Update table
        state_key = str(state)
        if state_key not in self.q_table:
            self.q_table[state_key] = [0.0]*len(self.action_space)
            
        self.q_table[state_key][action_idx] = new_q

class CoordinatorAgent:
    """
    Hierarchical Agent that oversees the ecosystem.
    It doesn't act directly but adjusts 'safety parameters' or 'epsilon'
    based on global health (Total Rewards).
    """
    def __init__(self):
        self.history = []
        
    def monitor(self, total_system_reward):
        self.history.append(total_system_reward)
        avg_reward = sum(self.history[-10:]) / min(len(self.history), 10)
        
        # Logic: If performance drops, encourage exploration (increase epsilon)
        # If stable/high, encourage exploitation
        recommendation = "STABLE"
        if len(self.history) > 5 and self.history[-1] < avg_reward * 0.8:
            recommendation = "ADAPT_URGENT"
        
        return recommendation
