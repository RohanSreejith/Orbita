import asyncio
from app.database import AsyncSessionLocal
from app.agents.restock_agent import RestockAgent
from app.models import StoreInventory, GlobalProduct, Order

async def run():
    async with AsyncSessionLocal() as db:
        agent = RestockAgent(db)
        print("Running Agent...")
        try:
            logs = await agent.run_cycle(1)
            print("Logs:", logs)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
