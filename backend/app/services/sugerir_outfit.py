"""
sugerir_outfit.py — Lógica de recomendación de outfit
Conecta el closet del usuario con GPT-4o para sugerir outfits.
"""

from sqlalchemy.orm import Session
from app.models.models import Prenda, Outfit, OutfitPrenda
from app.services.openai_service import sugerir_outfit_ia


def _temperatura_a_nivel(temp: float) -> str:
    """Convierte temperatura en Celsius a nivel semántico."""
    if temp <= 10:
        return "frio"
    elif temp <= 18:
        return "templado"
    else:
        return "calor"


def sugerir_outfit(
    usuario_id: int,
    temperatura: float,
    condiciones: list[str],
    ocasion: str,
    db: Session,
    clima_origen: dict | None = None,
    clima_destino: dict | None = None,
    prenda_fija_id: int | None = None,
    estilo: str | None = None,
) -> dict:
    """
    Obtiene todas las prendas del usuario y le pide a GPT-4o
    que arme el outfit más adecuado según clima y ocasión.

    Parámetros:
        usuario_id  : id del usuario autenticado
        temperatura : temperatura actual en °C
        condiciones : lista de condiciones del clima
                      Ej: ["lloviendo", "corre_viento"]
        ocasion     : "universidad" | "trabajo" | "casual"
        db          : sesión de base de datos

    Retorna:
        {
          "prenda_ids": [1, 3, 5],
          "prendas": [ { id, nombre, categoria_id, imagen_url, color }, ... ],
          "nivel_clima": "frio" | "templado" | "calor",
          "ocasion": str,
          "mensaje": str
        }
    """
    prendas_db = (
        db.query(Prenda)
        .filter(Prenda.usuario_id == usuario_id)
        .all()
    )

    if not prendas_db:
        return {
            "prenda_ids": [],
            "prendas": [],
            "nivel_clima": _temperatura_a_nivel(temperatura),
            "ocasion": ocasion,
            "mensaje": "No tienes prendas cargadas en tu closet. ¡Sube tu ropa primero!",
        }

    prendas_lista = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "color": p.color,
            "categoria": p.categoria_id,
            "ideal_clima": p.ideal_clima,
            "imagen_url": p.imagen_url,
        }
        for p in prendas_db
    ]

    descripcion_clima = ", ".join(condiciones) if condiciones else "sin condiciones especiales"

    # Armar contexto de ciudades para el prompt
    contexto_ciudades = None
    if clima_origen or clima_destino:
        partes = []
        if clima_origen:
            partes.append(
                f"Origen ({clima_origen['ciudad']}, {clima_origen.get('pais','')}): "
                f"{clima_origen['temperatura']}°C, {clima_origen['descripcion']}"
            )
        if clima_destino:
            partes.append(
                f"Destino ({clima_destino['ciudad']}, {clima_destino.get('pais','')}): "
                f"{clima_destino['temperatura']}°C, {clima_destino['descripcion']}"
            )
        contexto_ciudades = " → ".join(partes)

    prenda_fija = None
    if prenda_fija_id:
        pf = db.query(Prenda).filter(Prenda.id == prenda_fija_id).first()
        if pf:
            prenda_fija = {"id": pf.id, "nombre": pf.nombre, "color": pf.color, "categoria": pf.categoria_id}

    resultado_ia = sugerir_outfit_ia(
        prendas=prendas_lista,
        temperatura=temperatura,
        descripcion_clima=descripcion_clima,
        ocasion=ocasion,
        contexto_ciudades=contexto_ciudades,
        prenda_fija=prenda_fija,
        estilo=estilo,
    )

    prendas_seleccionadas = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "categoria_id": p.categoria_id,
            "imagen_url": p.imagen_url,
            "color": p.color,
        }
        for p in prendas_db
        if p.id in resultado_ia["prenda_ids"]
    ]

    return {
        "prenda_ids": resultado_ia["prenda_ids"],
        "prendas": prendas_seleccionadas,
        "nivel_clima": _temperatura_a_nivel(temperatura),
        "ocasion": ocasion,
        "mensaje": resultado_ia["mensaje"],
    }


def guardar_outfit_sugerido(
    usuario_id: int,
    nombre: str,
    ocasion_id: int,
    ideal_clima: str,
    prenda_ids: list[int],
    db: Session,
) -> Outfit:
    """
    Guarda el outfit recomendado (o creado por el usuario) en la base de datos.
    Crea el Outfit y las relaciones OutfitPrenda.
    """
    outfit = Outfit(
        usuario_id=usuario_id,
        ocasion_id=ocasion_id,
        nombre=nombre,
        ideal_clima=ideal_clima,
    )
    db.add(outfit)
    db.commit()
    db.refresh(outfit)

    for prenda_id in prenda_ids:
        relacion = OutfitPrenda(outfit_id=outfit.id, prenda_id=prenda_id)
        db.add(relacion)

    db.commit()
    return outfit