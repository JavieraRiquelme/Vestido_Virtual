from app.services.clima import obtener_clima, sugerir_outfit

def test_ciudad_valida():
    resultado = obtener_clima("Santiago")
    assert "error" not in resultado
    assert "temperatura" in resultado
    assert "descripcion" in resultado

def test_ciudad_invalida():
    resultado = obtener_clima("CiudadFalsa12345")
    assert "error" in resultado

def test_outfit_frio():
    resultado = sugerir_outfit("Santiago", "casual")
    assert "sugerencia" in resultado
    assert "tipo_clima"