from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import products, weather

app = FastAPI(title="CODEX '26 Kiosk System", version="1.0.0")

# Configure CORS for Frontend
origins = [
    "http://localhost:5173",  # React Dev Server
    "http://localhost:4173",  # Vite Preview
    "http://localhost",       # Kiosk Production
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

@app.get("/health")
async def health_check():
    return {"status": "ok", "system": "Orbita Kiosk"}
