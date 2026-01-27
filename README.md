# CODEX '26 - Kiosk System (Orbita)

## Overview
This is a high-performance, low-latency Kiosk System designed for a Retail Supply Chain. It features a unified interface for Retailers, Suppliers, and Customers, powered by a multi-agent AI system.

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite + TailwindCSS
- **Database:** SQLite (Async)
- **Deployment:** Ubuntu Kiosk (Openbox + Chromium)

## Setup (Windows Dev)
1. **Backend:**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Setup (Ubuntu Kiosk)
Run the setup script:
```bash
sudo ./kiosk-scripts/setup_kiosk.sh
```
