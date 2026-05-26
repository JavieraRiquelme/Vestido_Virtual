from fastapi import FastAPI

# from prendas import router as prenda_router
from app.api.routes import prendas

app = FastAPI()

app.include_router(
    prendas.router,
    prefix="/prendas",  # Agrega /prendas a todas las rutas del router
    tags=["prendas"]    # Agrupa en la documentación /docs
)

# GET /prendas, POST /prendas, etc.


