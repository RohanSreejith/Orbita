import requests
import json

URL = "http://127.0.0.1:8000/agent/notifications?store_id=1"

def check():
    try:
        res = requests.get(URL)
        if res.status_code == 200:
            data = res.json()
            print(f"Items: {len(data)}")
            print(json.dumps(data, indent=2))
        else:
            print("Error:", res.status_code)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    check()
