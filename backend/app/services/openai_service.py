from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def analizar_imagen_prenda(imagen_url: str) -> dict:
    """
    Recibe la URL de una imagen de prenda y devuelve
    su tipo, color y estilo detectados por GPT-4o.
    """
    respuesta = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analiza esta prenda de ropa y responde SOLO con este formato, "
                            "sin texto extra:\n"
                            "tipo: (ej: polera, pantalón, vestido, chaqueta, zapatos)\n"
                            "color: (ej: azul, rojo, blanco)\n"
                            "estilo: (ej: casual, formal, deportivo)"
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": imagen_url},
                    },
                ],
            }
        ],
        max_tokens=100,
    )

    texto = respuesta.choices[0].message.content.strip()

    resultado = {"tipo": None, "color": None, "estilo": None}
    for linea in texto.splitlines():
        if ":" in linea:
            clave, valor = linea.split(":", 1)
            clave = clave.strip().lower()
            valor = valor.strip().lower()
            if clave in resultado:
                resultado[clave] = valor

    return resultado


def sugerir_outfit_ia(
    prendas: list[dict],
    temperatura: float,
    descripcion_clima: str,
    ocasion: str,
    contexto_ciudades: str | None = None,
    prenda_fija: dict | None = None,
    estilo: str | None = None,
) -> dict:
    """
    Recibe las prendas del closet del usuario, el clima actual
    y la ocasión, y devuelve una sugerencia de outfit con mensaje.
    """
    if not prendas:
        return {
            "prenda_ids": [],
            "mensaje": "No tienes prendas cargadas en tu closet. ¡Sube tu ropa primero!",
        }

    lista_prendas = "\n".join(
        f"- id:{p['id']} | {p['nombre']} | color:{p.get('color','?')} "
        f"| categoria:{p.get('categoria','?')} | ideal_clima:{p.get('ideal_clima','?')}"
        for p in prendas
    )

    if contexto_ciudades:
        clima_texto = (
            f"El usuario viajará entre ciudades con estos climas:\n"
            f"{contexto_ciudades}\n"
            f"Temperatura mínima del recorrido: {temperatura}°C.\n"
            f"Considera si necesita capas para adaptarse a distintas temperaturas."
        )
    else:
        clima_texto = f"Clima actual: {temperatura}°C, {descripcion_clima}."

    extra = ""
    if prenda_fija:
        extra += (
            f"\nEl usuario quiere usar sí o sí esta prenda: "
            f"id:{prenda_fija['id']} | {prenda_fija['nombre']} | color:{prenda_fija.get('color','?')}. "
            f"Inclúyela obligatoriamente en el outfit y arma el resto en torno a ella.\n"
        )
    if estilo:
        extra += f"\nEstilo preferido: {estilo}. Adapta el outfit a este estilo.\n"

    prompt = (
        f"Eres un asistente de moda para la app Closy.\n"
        f"El usuario tiene estas prendas en su closet:\n{lista_prendas}\n\n"
        f"{clima_texto}\n"
        f"Ocasión: {ocasion}.{extra}\n"
        f"Elige las prendas más adecuadas para armar un outfit completo "
        f"(top, bottom, zapatos y opcionalmente accesorio). "
        f"Si hay diferencia de temperatura entre origen y destino, prioriza prendas en capas.\n"
        f"Responde SOLO con este formato, sin texto extra:\n"
        f"ids: 1,3,5\n"
        f"mensaje: (explica brevemente por qué elegiste ese outfit, en tono amigable)"
    )

    respuesta = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
    )

    texto = respuesta.choices[0].message.content.strip()

    prenda_ids = []
    mensaje = "¡Aquí está tu outfit para hoy!"

    for linea in texto.splitlines():
        if linea.startswith("ids:"):
            ids_texto = linea.replace("ids:", "").strip()
            prenda_ids = [int(x.strip()) for x in ids_texto.split(",") if x.strip().isdigit()]
        elif linea.startswith("mensaje:"):
            mensaje = linea.replace("mensaje:", "").strip()

    return {"prenda_ids": prenda_ids, "mensaje": mensaje}
