from fastapi import FastAPI
from app.api.routes import (
    usuarios,
    prendas,
    categorias,
    ocasiones,
    outfits,
    clima,
    estilos,
    recomendaciones,
)

app = FastAPI()

app.include_router(usuarios.router,          prefix="/usuarios",          tags=["usuarios"])
app.include_router(prendas.router,           prefix="/prendas",           tags=["prendas"])
app.include_router(categorias.router,        prefix="/categorias",        tags=["categorias"])
app.include_router(ocasiones.router,         prefix="/ocasiones",         tags=["ocasiones"])
app.include_router(outfits.router,           prefix="/outfits",           tags=["outfits"])
app.include_router(clima.router,             prefix="/clima",             tags=["clima"])
app.include_router(estilos.router,           prefix="/estilos",           tags=["estilos"])
app.include_router(recomendaciones.router,   prefix="/recomendaciones",   tags=["recomendaciones"])
