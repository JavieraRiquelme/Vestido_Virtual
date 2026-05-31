from fastapi import FastAPI
from app.api.routes.clima import router as clima_router

app = FastAPI(title="Vestidor Virtual")

app.include_router(clima_router)

@app.get("/")
def home():
    return {"mensaje": "hola!"}