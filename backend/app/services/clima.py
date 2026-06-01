import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from backend.app.core.config import settings
load_dotenv()

def obtener_clima(ciudad: str) -> dict:
    try:
        response = requests.get(
            settings.OPENWEATHER_URL,
            params={
                "q": ciudad,
                "appid": settings.OPENWEATHER_API_KEY,
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
            "icono": data["weather"][0]["icon"],
            "consultado_at": datetime.now()
        }
    except Exception as e:
        return {"error": str(e)}

def obtener_clima_gps(lat: float, lon: float) -> dict:
    try:
        response = requests.get(
            settings.OPENWEATHER_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric",
                "lang": "es"
            },
            timeout=5
        )
        if response.status_code != 200:
            return {"error": f"Error al obtener el clima: {response.status_code}"}
        
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
            "icono": data["weather"][0]["icon"],
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
    
    nombre = f"Outfit {clima['categoria']} {ocasion}"
    
    return {
        "nombre": nombre,
        "ciudad": clima["ciudad"],
        "pais": clima["pais"],
        "temperatura": clima["temperatura"],
        "ideal_clima": clima["categoria"],
        "descripcion": clima["descripcion"],
        "icono": clima["icono"],
        "consultado_at": clima["consultado_at"],
        "ocasion": ocasion,
        "sugerencia": sugerencia,
        "rating": None
    }