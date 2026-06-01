import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

response = requests.get(
    BASE_URL,
    params={
        "q": "Santiago",
        "appid": API_KEY,
        "units": "metric",
        "lang": "es"
    }
)

print(response.json())