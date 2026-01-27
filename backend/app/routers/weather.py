from fastapi import APIRouter
import httpx

router = APIRouter()

@router.get("/weather")
async def get_weather(lat: float = 51.51, lon: float = -0.13):
    # Defaulting to London for demo if not provided
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability&forecast_days=1"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()
        
    # Map WMO code to simple string
    code = data['current']['weather_code']
    condition = 'sunny'
    if code in [1, 2, 3]: condition = 'cloudy'
    elif code in [61, 63, 65, 80, 81, 82]: condition = 'rainy'
    elif code in [95, 96, 99]: condition = 'stormy'
    
    return {
        "condition": condition,
        "temperature": data['current']['temperature_2m'],
        "location": "London, UK",
        "recommendation": await get_agent_recommendation(condition, data['current']['temperature_2m'])
    }

from sqlalchemy.future import select
from ..database import AsyncSessionLocal
from ..models import StoreInventory, GlobalProduct
import random

import google.generativeai as genai
import os
import json

# Configure Gemini
# In production, use os.getenv("GEMINI_API_KEY")
API_KEY = "AIzaSyByQ6l_gmnzHSuJaVShP2DCe-n7eRJKoLQ"
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash')

async def get_agent_recommendation(condition: str, temp: float):
    # 1. Fetch Inventory for Store #1 (Default)
    async with AsyncSessionLocal() as db:
        query = (
            select(GlobalProduct)
            .join(StoreInventory, StoreInventory.product_id == GlobalProduct.id)
            .where(StoreInventory.store_id == 1) # Context: Kiosk Alpha
            .where(StoreInventory.stock > 0)     # Only suggest in-stock items
        )
        result = await db.execute(query)
        products = result.scalars().all()
        
    if not products:
        return {"item": "N/A", "reason": "Inventory Empty"}
        
    # 2. Construct Prompt
    inventory_list = ", ".join([f"{p.name} ({p.category})" for p in products])
    
    prompt = f"""
    You are an AI Retail Supply Chain Agent. 
    Current Weather in London: {condition}, {temp}°C.
    
    My Inventory: [{inventory_list}]
    
    Task: Select the ONE best product from my inventory to promote right now to maximize sales/utility.
    Output JSON ONLY: {{ "item": "Exact Product Name", "reason": "Short, data-driven insight (max 1 sentence)." }}
    """
    
    try:
        # 3. Ask Gemini
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Cleanup markdown formatting if present
        if text.startswith("```json"):
            text = text[7:-3]
            
        data = json.loads(text)
        return data
        
    except Exception as e:
        error_str = str(e)
        print(f"LLM Error: {error_str}")
        
        if "429" in error_str:
            return {"item": "Featured Item", "reason": "AI is experiencing high traffic (Rate Limit). Showing standard promotion."}
            
        return {"item": "Featured Item", "reason": "AI Connection temporarily unavailable. Displaying default promotion."}
