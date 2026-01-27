from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import products, weather, analytics, system, suppliers, agent, sales, retailers

app = FastAPI(title="CODEX '26 Kiosk System", version="1.0.0")

# Configure CORS for Frontend
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Kiosk System Backend Verified", "status": "running"}

app.include_router(products.router, tags=["products"])
app.include_router(weather.router, tags=["weather"])
app.include_router(analytics.router, tags=["analytics"])
app.include_router(system.router, tags=["system"])
app.include_router(suppliers.router, tags=["suppliers"])
app.include_router(retailers.router, tags=["retailers"])
app.include_router(agent.router, tags=["agent"])
app.include_router(agent.router, tags=["agent"])
app.include_router(sales.router, tags=["sales"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "system": "Orbita Kiosk"}
