import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

def obtener_clima(ciudad: str) -> dict:
    try:
        response = requests.get(
            BASE_URL,
            params={
                "q": ciudad,
                "appid": API_KEY,
                "units": "metric",
                "lang": "es"
            },
            timeout=5
        )
        if response.status_code == 404:
            return {"error": f"Ciudad '{ciudad}' no encontrada"}
        
        data = response.json()
        return {
            "ciudad": data["name"],
            "temperatura": round(data["main"]["temp"], 1),
            "descripcion": data["weather"][0]["description"],
            "humedad": data["main"]["humidity"],
        }
    except Exception as e:
        return {"error": str(e)}

def sugerir_outfit(ciudad: str, ocasion: str) -> dict:
    clima = obtener_clima(ciudad)
    
    if "error" in clima:
        return clima
    
    temperatura = clima["temperatura"]
    
    if temperatura < 14:
        tipo = "frio"
        sugerencia = "chaqueta, pantalón largo y zapatos cerrados"
    elif temperatura < 22:
        tipo = "templado"
        sugerencia = "polera, jeans y zapatillas"
    else:
        tipo = "calido"
        sugerencia = "vestido liviano o shorts y sandalias"
    
    return {
        "ciudad": clima["ciudad"],
        "temperatura": temperatura,
        "descripcion": clima["descripcion"],
        "tipo_clima": tipo,
        "ocasion": ocasion,
        "sugerencia": sugerencia
    }