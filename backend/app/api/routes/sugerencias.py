"""
sugerencias.py — Endpoints de recomendación de outfit
Isidora — Sprint 2 & 3
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.services.sugerir_outfit import sugerir_outfit, guardar_outfit_sugerido

router = APIRouter()


# ── Schemas de entrada/salida ────────────────────────────────────────────────

class SugerenciaRequest(BaseModel):
    usuario_id: int
    temperatura: float
    condiciones: list[str]        # ["lloviendo", "corre_viento", "sol_fuerte", "nublado"]
    ocasion: str                  # "universidad" | "trabajo" | "casual"


class GuardarOutfitRequest(BaseModel):
    usuario_id: int
    nombre: str
    ocasion_id: int
    ideal_clima: str
    prenda_ids: list[int]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/sugerir")
def sugerir(datos: SugerenciaRequest, db: Session = Depends(get_db)):
    """
    Recibe clima + ocasión y devuelve una sugerencia de outfit
    con las prendas del usuario.
    """
    if datos.temperatura < -50 or datos.temperatura > 60:
        raise HTTPException(status_code=422, detail="Temperatura fuera de rango válido")

    ocasiones_validas = {"universidad", "trabajo", "casual"}
    if datos.ocasion not in ocasiones_validas:
        raise HTTPException(
            status_code=422,
            detail=f"Ocasión inválida. Debe ser una de: {ocasiones_validas}",
        )

    resultado = sugerir_outfit(
        usuario_id=datos.usuario_id,
        temperatura=datos.temperatura,
        condiciones=datos.condiciones,
        ocasion=datos.ocasion,
        db=db,
    )
    return resultado


@router.post("/guardar")
def guardar(datos: GuardarOutfitRequest, db: Session = Depends(get_db)):
    """
    Guarda un outfit (sugerido o creado por el usuario) en la base de datos.
    """
    if not datos.prenda_ids:
        raise HTTPException(status_code=422, detail="El outfit debe tener al menos una prenda")

    outfit = guardar_outfit_sugerido(
        usuario_id=datos.usuario_id,
        nombre=datos.nombre,
        ocasion_id=datos.ocasion_id,
        ideal_clima=datos.ideal_clima,
        prenda_ids=datos.prenda_ids,
        db=db,
    )
    return {"mensaje": "Outfit guardado exitosamente", "outfit_id": outfit.id}
