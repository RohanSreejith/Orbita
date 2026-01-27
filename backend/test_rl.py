import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/inventory/rl"

def test_rl():
    print("Testing RL Endpoints...")
    
    # 1. Test Training
    print("\n1. Triggering Training (100 episodes)...")
    try:
        res = requests.post(f"{BASE_URL}/train?episodes=100")
        if res.status_code == 200:
            print("   ✅ Training Success:", json.dumps(res.json(), indent=2))
        else:
            print("   ❌ Training Failed:", res.status_code, res.text)
    except Exception as e:
        print("   ❌ Connection Error:", e)
        return

    # 2. Test Simulation
    print("\n2. Running Simulation (5 days)...")
    try:
        res = requests.get(f"{BASE_URL}/simulation?days=5")
        if res.status_code == 200:
            data = res.json()
            print(f"   ✅ Simulation Success (Returned {len(data)} days)")
            print("   Sample Day:", json.dumps(data[0], indent=2))
        else:
            print("   ❌ Simulation Failed:", res.status_code, res.text)
    except Exception as e:
        print("   ❌ Connection Error:", e)

if __name__ == "__main__":
    # Wait a bit for server to fully start if it just restarted
    time.sleep(2)
    test_rl()
