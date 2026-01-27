import numpy as np
import pickle
import os

class QLearningAgent:
    def __init__(self, actions, learning_rate=0.1, discount_factor=0.9, epsilon=0.1):
        self.q_table = {}  # Map (state) -> [q_values]
        self.actions = actions
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.filename = "q_table.pkl"

    def get_state_key(self, state):
        """Convert list/tuple state to string key for dictionary"""
        return str(state)

    def get_q_values(self, state):
        key = self.get_state_key(state)
        if key not in self.q_table:
            self.q_table[key] = np.zeros(len(self.actions))
        return self.q_table[key]

    def choose_action(self, state, train=True):
        if train and np.random.uniform(0, 1) < self.epsilon:
            return np.random.choice(self.actions)  # Explore
        else:
            q_values = self.get_q_values(state)
            return self.actions[np.argmax(q_values)]  # Exploit

    def learn(self, state, action, reward, next_state):
        key = self.get_state_key(state)
        q_values = self.get_q_values(state)
        
        next_q_values = self.get_q_values(next_state)
        max_next_q = np.max(next_q_values)
        
        action_idx = self.actions.index(action)
        
        # Bellman Equation
        current_q = q_values[action_idx]
        new_q = current_q + self.lr * (reward + self.gamma * max_next_q - current_q)
        q_values[action_idx] = new_q
        self.q_table[key] = q_values

    def save_model(self, path=None):
        path = path or self.filename
        with open(path, 'wb') as f:
            pickle.dump(self.q_table, f)
        print(f"Model saved to {path}")

    def load_model(self, path=None):
        path = path or self.filename
        if os.path.exists(path):
            with open(path, 'rb') as f:
                self.q_table = pickle.load(f)
            print(f"Model loaded from {path}")
        else:
            print("No model found, starting fresh.")
