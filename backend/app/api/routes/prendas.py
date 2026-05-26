from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.prenda import PrendaCreate
from app.core.database import get_db
from app.models.prenda import Prenda

router = APIRouter()   # Enrutador

@router.get("/")
def listar(
    db: Session = Depends(get_db)
):
    return db.query(Prenda).all()

@router.post("/")      # POST /prendas
def crear(datos: PrendaCreate, db: Session = Depends(get_db)):
    prenda = Prenda(**datos.model_dump())
    db.add(prenda)
    db.commit()
    db.refresh(prenda)
    return prenda

#POST /prendas con body {"nombre": "Polera", "categoria": "casual"

@router.get("/{prenda_id}")
def obtener(prenda_id: int, db: Session = Depends(get_db)):
    prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    return prenda

#GET /prendas/5 -> prenda_id = 5
#GET /prendas/abc -> Error 422 (no es int)

