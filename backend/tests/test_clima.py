"""
test_clima.py — Tests del servicio de clima
"""
import pytest
from unittest.mock import patch, MagicMock
from app.services.clima import obtener_clima, _categorizar


def test_categorizar_frio():
    assert _categorizar(10) == "frio"
    assert _categorizar(-5) == "frio"


def test_categorizar_templado():
    assert _categorizar(15) == "templado"
    assert _categorizar(21) == "templado"


def test_categorizar_calido():
    assert _categorizar(25) == "calido"
    assert _categorizar(35) == "calido"


def test_obtener_clima_ciudad_ok():
    mock_respuesta = MagicMock()
    mock_respuesta.status_code = 200
    mock_respuesta.json.return_value = {
        "name": "Santiago",
        "sys": {"country": "CL"},
        "main": {"temp": 20.0},
        "weather": [{"description": "soleado", "icon": "01d"}],
    }
    with patch("app.services.clima.requests.get", return_value=mock_respuesta):
        resultado = obtener_clima("Santiago")
    assert resultado["ciudad"] == "Santiago"
    assert resultado["pais"] == "CL"
    assert resultado["temperatura"] == 20.0
    assert resultado["categoria"] == "templado"


def test_obtener_clima_ciudad_no_encontrada():
    mock_respuesta = MagicMock()
    mock_respuesta.status_code = 404
    with patch("app.services.clima.requests.get", return_value=mock_respuesta):
        with pytest.raises(Exception, match="no encontrada"):
            obtener_clima("CiudadFalsa")


def test_obtener_clima_error_servidor():
    mock_respuesta = MagicMock()
    mock_respuesta.status_code = 500
    with patch("app.services.clima.requests.get", return_value=mock_respuesta):
        with pytest.raises(Exception, match="Error al obtener el clima"):
            obtener_clima("Santiago")