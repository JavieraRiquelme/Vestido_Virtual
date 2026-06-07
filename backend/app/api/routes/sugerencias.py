"""
sugerencias.py — Endpoints de recomendación de outfit
Isidora — Sprint 2 & 3
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.services.sugerir_outfit import sugerir_outfit, guardar_outfit_sugerido
from app.services.clima import obtener_clima

router = APIRouter()


# ── Schemas de entrada/salida ────────────────────────────────────────────────

class SugerenciaRequest(BaseModel):
    usuario_id: int
    ocasion: str
    ciudad_origen: str | None = None
    ciudad_destino: str | None = None
    temperatura: float = 20.0
    condiciones: list[str] = []
    prenda_fija_id: int | None = None
    estilo: str | None = None


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
    Recibe ciudades (o clima manual) + ocasión y devuelve una sugerencia de outfit.
    Si se proveen ciudades, consulta OpenWeather para obtener el clima real.
    """
    ocasiones_validas = {"universidad", "trabajo", "casual", "fiesta", "deporte", "cita"}
    if datos.ocasion not in ocasiones_validas:
        raise HTTPException(
            status_code=422,
            detail=f"Ocasión inválida. Debe ser una de: {ocasiones_validas}",
        )

    clima_origen = None
    clima_destino = None

    if datos.ciudad_origen:
        try:
            clima_origen = obtener_clima(datos.ciudad_origen)
        except Exception:
            raise HTTPException(status_code=404, detail=f"Ciudad de origen '{datos.ciudad_origen}' no encontrada")

    if datos.ciudad_destino:
        try:
            clima_destino = obtener_clima(datos.ciudad_destino)
        except Exception:
            raise HTTPException(status_code=404, detail=f"Ciudad de destino '{datos.ciudad_destino}' no encontrada")

    # Temperatura representativa para filtrado de prendas: la más fría (caso crítico)
    if clima_origen and clima_destino:
        temperatura = min(clima_origen["temperatura"], clima_destino["temperatura"])
    elif clima_origen:
        temperatura = clima_origen["temperatura"]
    elif clima_destino:
        temperatura = clima_destino["temperatura"]
    else:
        temperatura = datos.temperatura

    resultado = sugerir_outfit(
        usuario_id=datos.usuario_id,
        temperatura=temperatura,
        condiciones=datos.condiciones,
        ocasion=datos.ocasion,
        clima_origen=clima_origen,
        clima_destino=clima_destino,
        prenda_fija_id=datos.prenda_fija_id,
        estilo=datos.estilo,
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
