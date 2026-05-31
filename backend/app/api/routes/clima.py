from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Clima
from app.services.clima_service import get_clima

router = APIRouter()


@router.get("/consultar")
def consultar_clima(lat: float, lon: float, db: Session = Depends(get_db)):
    try:
        datos = get_clima(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

    registro = Clima(
        ciudad=datos["ciudad"],
        temperatura=datos["temperatura"],
        descripcion=datos["descripcion"],
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
