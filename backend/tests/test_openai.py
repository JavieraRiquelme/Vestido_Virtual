"""
test_openai.py — Tests del servicio de OpenAI
"""
from unittest.mock import patch, MagicMock
from app.services.openai_service import analizar_imagen_prenda, sugerir_outfit_ia


def test_analizar_imagen_prenda_ok():
    mock_respuesta = MagicMock()
    mock_respuesta.choices[0].message.content = (
        "tipo: polera\n"
        "color: azul\n"
        "estilo: casual"
    )

    with patch("app.services.openai_service.client.chat.completions.create",
               return_value=mock_respuesta):
        resultado = analizar_imagen_prenda("https://ejemplo.com/polera.jpg")

    assert resultado["tipo"] == "polera"
    assert resultado["color"] == "azul"
    assert resultado["estilo"] == "casual"


def test_analizar_imagen_prenda_sin_datos():
    mock_respuesta = MagicMock()
    mock_respuesta.choices[0].message.content = ""

    with patch("app.services.openai_service.client.chat.completions.create",
               return_value=mock_respuesta):
        resultado = analizar_imagen_prenda("https://ejemplo.com/polera.jpg")

    assert resultado["tipo"] is None
    assert resultado["color"] is None
    assert resultado["estilo"] is None


def test_sugerir_outfit_ia_ok():
    mock_respuesta = MagicMock()
    mock_respuesta.choices[0].message.content = (
        "ids: 1,3,5\n"
        "mensaje: Te recomiendo este outfit porque hace frío hoy."
    )

    prendas = [
        {"id": 1, "nombre": "Chaqueta negra", "color": "negro", "categoria": 1, "ideal_clima": "frio"},
        {"id": 3, "nombre": "Jeans azul", "color": "azul", "categoria": 3, "ideal_clima": "templado"},
        {"id": 5, "nombre": "Zapatillas blancas", "color": "blanco", "categoria": 5, "ideal_clima": "templado"},
    ]

    with patch("app.services.openai_service.client.chat.completions.create",
               return_value=mock_respuesta):
        resultado = sugerir_outfit_ia(
            prendas=prendas,
            temperatura=8.0,
            descripcion_clima="lloviendo",
            ocasion="universidad",
        )

    assert resultado["prenda_ids"] == [1, 3, 5]
    assert "frío" in resultado["mensaje"]


def test_sugerir_outfit_ia_sin_prendas():
    resultado = sugerir_outfit_ia(
        prendas=[],
        temperatura=20.0,
        descripcion_clima="soleado",
        ocasion="casual",
    )

    assert resultado["prenda_ids"] == []
    assert "closet" in resultado["mensaje"]