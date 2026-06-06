from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    auth, 
    usuarios,
    prendas,
    categorias,
    ocasiones,
    outfits,
    clima,
    estilos,
    recomendaciones,
    sugerencias,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:5173", "https://vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_header=["*"],
)

app.include_router(auth.router,              prefix="/auth",              tags=["auth"])
app.include_router(usuarios.router,          prefix="/usuarios",          tags=["usuarios"])
app.include_router(prendas.router,           prefix="/prendas",           tags=["prendas"])
app.include_router(categorias.router,        prefix="/categorias",        tags=["categorias"])
app.include_router(ocasiones.router,         prefix="/ocasiones",         tags=["ocasiones"])
app.include_router(outfits.router,           prefix="/outfits",           tags=["outfits"])
app.include_router(clima.router,             prefix="/clima",             tags=["clima"])
app.include_router(estilos.router,           prefix="/estilos",           tags=["estilos"])
app.include_router(recomendaciones.router,   prefix="/recomendaciones",   tags=["recomendaciones"])
app.include_router(sugerencias.router,       prefix="/sugerencias",       tags=["sugerencias"])
