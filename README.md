#  CODEX ’26 — ORBITA  
### Optimized Reinforcement-Based Inventory & Trade Autonomy

> **ORBITA** is an **edge-native, offline-first kiosk system** designed for intelligent retail supply-chain decision-making.  
> It delivers **proactive, explainable inventory intelligence** directly at the point of operation using a **locked Ubuntu kiosk environment**.

---

## 🧠 Problem Statement
Retail supply chains often face:
- Stockouts due to unpredictable and seasonal demand
- Overstocking and wastage from reactive decisions
- Heavy dependence on cloud connectivity
- Complex systems that are difficult to deploy at store level

---

## 💡 Our Solution
ORBITA is a **bootable kiosk system** that runs on a single Ubuntu machine and provides:
- Demand-aware, proactive inventory recommendations  
- A unified interface for **Customers, Retailers, and Suppliers**  
- Offline operation with minimal hardware requirements  
- Explainable, learning-based decision support  

---

## ✨ Key Highlights
- 🖥️ **Kiosk-Mode Deployment** (auto-boot, full-screen, locked UI)
- 🧠 **Learning-Inspired Decision Logic** (reward-based, adaptive)
- 📊 **Demand-Aware Optimization**
- 📴 **Offline-First / Edge-Native Architecture**
- ⚡ **Low Latency & Low Memory Footprint**
- 🔍 **Explainable “Glass-Box” Decisions**

---

---

## 🧰 Tech Stack

### Frontend
- **React + Vite** — fast, optimized single-page application
- **TailwindCSS** — clean and responsive UI
- **Zustand** — lightweight state management

### Backend
- **FastAPI (Python)** — asynchronous, high-performance APIs
- **Pydantic** — data validation
- **JWT Authentication** — lightweight and stateless

### Database
- **SQLite (Async)** — serverless, low-memory, offline-friendly

## 🧪 Development Setup (Windows)

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload


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
