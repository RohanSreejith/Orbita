import google.generativeai as genai
import os

API_KEY = "AIzaSyByQ6l_gmnzHSuJaVShP2DCe-n7eRJKoLQ"
genai.configure(api_key=API_KEY)

print("Listing available models...")
try:
    with open("models.txt", "w") as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
                f.write(f"{m.name}\n")
except Exception as e:
    print(f"Error: {e}")
    with open("models.txt", "w") as f:
        f.write(str(e))
