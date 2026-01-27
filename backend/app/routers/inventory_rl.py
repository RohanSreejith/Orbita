from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.ml.rl_logic import rl_system

router = APIRouter(prefix="/inventory/rl", tags=["Review System"])

class SimulationResponse(BaseModel):
    day: int
    demand: int
    store_stock_start: int
    store_order: int
    store_stock_end: int
    warehouse_stock: int
    warehouse_replenish: int
    sales_reward: float

class TrainResponse(BaseModel):
    message: str
    episodes_run: int
    avg_reward: float
    total_trained_episodes: int

@router.post("/train", response_model=TrainResponse)
async def train_agents(episodes: int = 500):
    """
    Triggers a training session for the Multi-Agent RL system.
    Returns the average reward of the last 50 episodes.
    """
    stats = rl_system.train(episodes)
    return {
        "message": "Training completed successfully",
        "episodes_run": episodes,
        "avg_reward": stats["avg_reward"],
        "total_trained_episodes": stats["episodes"]
    }

@router.get("/simulation", response_model=List[SimulationResponse])
async def get_simulation(days: int = 15):
    """
    Runs a simulation using the current trained policy.
    Shows how the agents coordinate to manage inventory.
    """
    history = rl_system.run_simulation_scenario(days)
    return history

@router.get("/status")
async def get_system_status():
    return {
        "store_agent_epsilon": rl_system.store_agent.epsilon,
        "warehouse_agent_epsilon": rl_system.warehouse_agent.epsilon,
        "trained_episodes": rl_system.trained_episodes
    }
