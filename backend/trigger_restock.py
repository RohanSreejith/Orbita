import requests
import json
import time

URL = "http://127.0.0.1:8000/agent/run-restock?store_id=1"

def trigger():
    print("Triggering Restock Agent...")
    try:
        res = requests.post(URL)
        if res.status_code == 200:
            print("✅ Agent Run Success!")
            print("Logs:", json.dumps(res.json(), indent=2))
        else:
            print("❌ Agent Failed:", res.status_code, res.text)
    except Exception as e:
        print("❌ Error:", e)

if __name__ == "__main__":
    time.sleep(2) # Wait for server
    trigger()
