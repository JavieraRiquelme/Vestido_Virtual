import uuid
from app.core.database import get_supabase

BUCKET = "prendas"

def subir_imagen(archivo_bytes: bytes, nombre_archivo: str, usuario_id: int) -> str:
    """
    Sube una imagen a Supabase Storage y retorna su URL pública.

    Parámetros:
        archivo_bytes  : contenido del archivo en bytes
        nombre_archivo : nombre original del archivo (ej: "polera.jpg")
        usuario_id     : id del usuario, para organizar en carpetas

    Retorna:
        URL pública de la imagen subida
    """
    supabase = get_supabase()

    extension = nombre_archivo.split(".")[-1].lower()
    nombre_unico = f"{usuario_id}/{uuid.uuid4()}.{extension}"

    supabase.storage.from_(BUCKET).upload(
        path=nombre_unico,
        file=archivo_bytes,
        file_options={"content-type": f"image/{extension}"}
    )

    url = supabase.storage.from_(BUCKET).get_public_url(nombre_unico)
    return url