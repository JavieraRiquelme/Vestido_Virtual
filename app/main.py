from fastapi import FastAPI

app = FastAPI(title="Vestidor Virtual") # Creamos la APP

@app.get("/")                           # Define ruta GET
def home():                             # Función que maneja la request
    return {"mensaje": "hola!"}         # FastAPI convierte dict a JSON 

# uvicorn main:app --reload 
# main -> archivo main.py ; app -> variable app dentro del archivo ; --reload -> reinicia cuando cambio el código
# --reload solo en desarrollo
