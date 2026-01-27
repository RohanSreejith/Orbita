from fastapi import APIRouter
import psutil
import os

router = APIRouter()

@router.get("/system/stats")
async def get_system_stats():
    # Get Real System Stats
    cpu = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory()
    
    return {
        "cpu": cpu,
        "ram_percent": ram.percent,
        "ram_used_gb": round(ram.used / (1024**3), 1),
        "ram_total_gb": round(ram.total / (1024**3), 1)
    }
