import requests
from datetime import datetime
from app.core.config import settings


def _categorizar(temperatura: float) -> str:
    if temperatura < 14:
        return "frio"
    elif temperatura < 22:
        return "templado"
    return "calido"


def obtener_clima(ciudad: str) -> dict:
    response = requests.get(
        settings.OPENWEATHER_URL,
        params={
            "q": ciudad,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",
            "lang": "es",
        },
        timeout=5,
    )
    if response.status_code == 404:
        raise Exception(f"Ciudad '{ciudad}' no encontrada")
    if response.status_code != 200:
        raise Exception(f"Error al obtener el clima: {response.status_code}")
    data = response.json()
    temperatura = round(data["main"]["temp"], 1)
    return {
        "ciudad": data["name"],
        "pais": data["sys"]["country"],
        "temperatura": temperatura,
        "categoria": _categorizar(temperatura),
        "descripcion": data["weather"][0]["description"],
        "icono": data["weather"][0]["icon"],
        "consultado_at": datetime.now(),
    }


def obtener_clima_gps(lat: float, lon: float) -> dict:
    response = requests.get(
        settings.OPENWEATHER_URL,
        params={
            "lat": lat,
            "lon": lon,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",
            "lang": "es",
        },
        timeout=5,
    )
    if response.status_code != 200:
        raise Exception(f"Error al obtener el clima: {response.status_code}")
    data = response.json()
    temperatura = round(data["main"]["temp"], 1)
    return {
        "ciudad": data["name"],
        "pais": data["sys"]["country"],
        "temperatura": temperatura,
        "categoria": _categorizar(temperatura),
        "descripcion": data["weather"][0]["description"],
        "icono": data["weather"][0]["icon"],
        "consultado_at": datetime.now(),
    }