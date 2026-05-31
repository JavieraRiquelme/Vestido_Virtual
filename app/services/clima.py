import requests
import os
from dotenv import load_dotenv
from datetime import datetime

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
        temperatura = round(data["main"]["temp"], 1)

        if temperatura < 14:
            categoria = "frio"
        elif temperatura < 22:
            categoria = "templado"
        else:
            categoria = "calido"

        return {
            "ciudad": data["name"],
            "pais": data["sys"]["country"],
            "temperatura": temperatura,
            "categoria": categoria,
            "descripcion": data["weather"][0]["description"],
            "consultado_at": datetime.now()
        }
    except Exception as e:
        return {"error": str(e)}

def sugerir_outfit(ciudad: str, ocasion: str) -> dict:
    clima = obtener_clima(ciudad)
    
    if "error" in clima:
        return clima
    
    if clima["categoria"] == "frio":
        sugerencia = "chaqueta, pantalón largo y zapatos cerrados"
    elif clima["categoria"] == "templado":
        sugerencia = "polera, jeans y zapatillas"
    else:
        sugerencia = "vestido liviano o shorts y sandalias"
    
    return {
        "ciudad": clima["ciudad"],
        "pais": clima["pais"],
        "temperatura": clima["temperatura"],
        "categoria": clima["categoria"],
        "descripcion": clima["descripcion"],
        "consultado_at": clima["consultado_at"],
        "ocasion": ocasion,
        "sugerencia": sugerencia
    }