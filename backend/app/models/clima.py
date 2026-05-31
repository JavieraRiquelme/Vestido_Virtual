import random

def obtener_datos_clima():
    """Simula los datos de temperatura y humedad"""
    return {
        "temperatura": round(random.uniform(15.0, 30.0), 1),
        "humedad": round(random.uniform(40.0, 80.0), 1),
        "descripcion": "Soleado"
    }