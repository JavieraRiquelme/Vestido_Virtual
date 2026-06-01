"""
sugerir_outfit.py — Lógica de recomendación de outfit
Isidora — Sprint 2

Dado el clima actual (temperatura + condición) y la ocasión del día,
filtra las prendas del usuario y arma una sugerencia de outfit.
"""

from sqlalchemy.orm import Session
from app.models.models import Prenda, Outfit, OutfitPrenda


# ── Mapeo de categorías ──────────────────────────────────────────────────────
# categoria_id debe coincidir con la tabla de categorías definida por Catalina.
# Convención acordada en reunión del equipo (semana 2):
#   1  → top/large   (polera manga larga, chaqueta, poleron)
#   2  → top/short   (polera manga corta, vestido corto)
#   3  → bottom/large (pantalón largo, falda larga)
#   4  → bottom/short (pantalón corto, falda corta)
#   5  → shoes
#   6  → accessories

CATEGORIA_TOP_LARGO  = 1
CATEGORIA_TOP_CORTO  = 2
CATEGORIA_BOTTOM_LARGO = 3
CATEGORIA_BOTTOM_CORTO = 4
CATEGORIA_ZAPATOS    = 5
CATEGORIA_ACCESORIOS = 6


def _temperatura_a_nivel(temp: float) -> str:
    """Convierte temperatura en Celsius a nivel semántico."""
    if temp <= 10:
        return "frio"
    elif temp <= 18:
        return "templado"
    else:
        return "calor"


def _categorias_recomendadas(temp: float, condiciones: list[str]) -> list[int]:
    """
    Devuelve la lista de categoria_id preferidos según clima.

    Reglas:
    - Frío (≤10°C): top largo + bottom largo
    - Templado (10–18°C): top largo o corto + bottom largo
    - Calor (>18°C): top corto + bottom corto o largo
    - Lluvia siempre suma top largo (capa extra)
    """
    nivel = _temperatura_a_nivel(temp)
    llueve = "lluvia" in condiciones or "lloviendo" in condiciones

    if nivel == "frio" or llueve:
        return [CATEGORIA_TOP_LARGO, CATEGORIA_BOTTOM_LARGO, CATEGORIA_ZAPATOS, CATEGORIA_ACCESORIOS]
    elif nivel == "templado":
        return [CATEGORIA_TOP_LARGO, CATEGORIA_BOTTOM_LARGO, CATEGORIA_ZAPATOS, CATEGORIA_ACCESORIOS]
    else:  # calor
        return [CATEGORIA_TOP_CORTO, CATEGORIA_BOTTOM_CORTO, CATEGORIA_ZAPATOS, CATEGORIA_ACCESORIOS]


def sugerir_outfit(
    usuario_id: int,
    temperatura: float,
    condiciones: list[str],
    ocasion: str,
    db: Session,
) -> dict:
    """
    Sugiere un outfit para el usuario.

    Parámetros:
        usuario_id  : id del usuario autenticado
        temperatura : temperatura actual en °C
        condiciones : lista de condiciones del clima seleccionadas
                      Ej: ["lloviendo", "corre_viento"]
        ocasion     : "universidad" | "trabajo" | "casual"
        db          : sesión de base de datos

    Retorna:
        {
          "prendas": [ { id, nombre, categoria_id, imagen_url, color }, ... ],
          "nivel_clima": "frio" | "templado" | "calor",
          "ocasion": str,
          "mensaje": str
        }
    """
    categorias = _categorias_recomendadas(temperatura, condiciones)
    nivel = _temperatura_a_nivel(temperatura)

    # Traer todas las prendas del usuario que coincidan con las categorías
    prendas_disponibles = (
        db.query(Prenda)
        .filter(
            Prenda.usuario_id == usuario_id,
            Prenda.categoria_id.in_(categorias),
        )
        .all()
    )

    if not prendas_disponibles:
        return {
            "prendas": [],
            "nivel_clima": nivel,
            "ocasion": ocasion,
            "mensaje": "No tienes prendas cargadas para este clima. ¡Sube más ropa a tu closet!",
        }

    # Seleccionar una prenda por categoría (la primera disponible)
    # En futuras versiones: aplicar filtros de color/ocasión más sofisticados
    seleccionadas = {}
    for prenda in prendas_disponibles:
        cat = prenda.categoria_id
        if cat not in seleccionadas:
            seleccionadas[cat] = prenda

    prendas_outfit = list(seleccionadas.values())

    # Construir mensaje personalizado según ocasión y clima
    mensajes = {
        "universidad": {
            "frio":     "Para clases con este frío, te recomiendo abrigarte bien. ¡Llevas el look!",
            "templado": "Día de universidad templado, look equilibrado y cómodo. ¡Tú puedes!",
            "calor":    "Hace calor en la u hoy, algo fresco y cómodo es ideal.",
        },
        "trabajo": {
            "frio":     "Reuniones con frío: elegante y abrigado/a. ¡Vas a impresionar!",
            "templado": "Día de trabajo con clima perfecto. Look profesional listo.",
            "calor":    "Calor en la oficina: fresco pero formal. ¡Excelente elección!",
        },
        "casual": {
            "frio":     "Día casual con frío: comfy y estiloso/a. ¡Perfecto!",
            "templado": "Clima ideal para un look casual. ¡Disfruta el día!",
            "calor":    "Calorcito casual: ligero y con onda. ¡Que calor, pero qué look!",
        },
    }

    mensaje = mensajes.get(ocasion, {}).get(nivel, "¡Para lo que harás hoy, te recomiendo este outfit!")

    return {
        "prendas": [
            {
                "id": p.id,
                "nombre": p.nombre,
                "categoria_id": p.categoria_id,
                "imagen_url": p.imagen_url,
                "color": p.color,
            }
            for p in prendas_outfit
        ],
        "nivel_clima": nivel,
        "ocasion": ocasion,
        "mensaje": mensaje,
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
