"""
test_storage.py — Tests del servicio de almacenamiento de imágenes
"""
from unittest.mock import patch, MagicMock
from app.services.storage import subir_imagen


def test_subir_imagen_ok():
    mock_supabase = MagicMock()
    mock_supabase.storage.from_().get_public_url.return_value = (
        "https://supabase.com/storage/prendas/1/imagen.jpg"
    )

    with patch("app.services.storage.get_supabase", return_value=mock_supabase):
        url = subir_imagen(
            archivo_bytes=b"contenido de prueba",
            nombre_archivo="polera.jpg",
            usuario_id=1,
        )

    assert url == "https://supabase.com/storage/prendas/1/imagen.jpg"
    assert mock_supabase.storage.from_().upload.called


def test_subir_imagen_genera_nombre_unico():
    mock_supabase = MagicMock()
    mock_supabase.storage.from_().get_public_url.return_value = (
        "https://supabase.com/storage/prendas/1/uuid.jpg"
    )

    with patch("app.services.storage.get_supabase", return_value=mock_supabase):
        subir_imagen(
            archivo_bytes=b"contenido",
            nombre_archivo="foto.jpg",
            usuario_id=1,
        )

    llamada = mock_supabase.storage.from_().upload.call_args
    path = llamada[1]["path"] if "path" in llamada[1] else llamada[0][0]
    assert path.startswith("1/")
    assert path.endswith(".jpg")


def test_subir_imagen_extension_correcta():
    mock_supabase = MagicMock()
    mock_supabase.storage.from_().get_public_url.return_value = (
        "https://supabase.com/storage/prendas/2/imagen.png"
    )

    with patch("app.services.storage.get_supabase", return_value=mock_supabase):
        subir_imagen(
            archivo_bytes=b"contenido",
            nombre_archivo="foto.png",
            usuario_id=2,
        )

    llamada = mock_supabase.storage.from_().upload.call_args
    opciones = llamada[1]["file_options"] if "file_options" in llamada[1] else llamada[0][2]
    assert opciones["content-type"] == "image/png"