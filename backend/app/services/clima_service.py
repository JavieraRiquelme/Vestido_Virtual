import requests
from app.core.config import settings

def get_clima(lat: float, lon: float) -> dict:
    """
    Recibe la latitud y longitud del usuario
    y devuelve la temperatura y condición del clima.
    """
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",  # temperatura en Celsius
        "lang": "es"        # descripción en español
    }

    response = requests.get(settings.OPENWEATHER_URL, params=params)

    if response.status_code != 200:
        raise Exception(f"Error al obtener el clima: {response.status_code}")

    data = response.json()

    return {
        "ciudad": data["name"],
        "temperatura": data["main"]["temp"],
        "descripcion": data["weather"][0]["description"],
        "icono": data["weather"][0]["icon"]
    }s