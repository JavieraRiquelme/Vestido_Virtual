import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Clima
from app.services.clima import obtener_clima
from app.core.config import settings

router = APIRouter()


@router.get("/autocomplete")
def autocomplete_ciudad(q: str = Query(..., min_length=2)):
    try:
        res = requests.get(
            "http://api.openweathermap.org/geo/1.0/direct",
            params={"q": q, "limit": 5, "appid": settings.OPENWEATHER_API_KEY},
            timeout=4,
        )
        sugerencias = [
            {
                "nombre": item["name"],
                "pais":   item.get("country", ""),
                "estado": item.get("state", ""),
                "lat":    item["lat"],
                "lon":    item["lon"],
            }
            for item in res.json()
        ]
        return sugerencias
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/ciudad")
def consultar_por_ciudad(q: str = Query(..., description="Nombre de la ciudad")):
    try:
        datos = obtener_clima(q)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    return datos



@router.get("/consultar")
def consultar_clima(ciudad: str, db: Session = Depends(get_db)):
    try:
        datos = obtener_clima(ciudad)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    registro = Clima(
        ciudad=datos["ciudad"],
        pais=datos.get("pais"),
        temperatura=datos["temperatura"],
        categoria=datos["categoria"],
        descripcion=datos["descripcion"],
        consultado_at=datos["consultado_at"],
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro


@router.get("/")
def listar(db: Session = Depends(get_db)):
    return db.query(Clima).all()


@router.get("/{clima_id}")
def obtener(clima_id: int, db: Session = Depends(get_db)):
    clima = db.query(Clima).filter(Clima.id == clima_id).first()
    if not clima:
        raise HTTPException(status_code=404, detail="Registro de clima no encontrado")
    return clima