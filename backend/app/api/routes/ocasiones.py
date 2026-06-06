from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.ocasion import OcasionCreate, OcasionRead
from app.core.database import get_db
from app.models.models import Ocasion

router = APIRouter()


@router.get("/", response_model = list[OcasionRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Ocasion).all()


@router.get("/{ocasion_id}", response_model = OcasionRead)
def obtener(ocasion_id: int, db: Session = Depends(get_db)):
    ocasion = db.query(Ocasion).filter(Ocasion.id == ocasion_id).first()
    if not ocasion:
        raise HTTPException(status_code=404, detail="Ocasion no encontrada")
    return ocasion


@router.post("/", response_model = OcasionRead)
def crear(datos: OcasionCreate, db: Session = Depends(get_db)):
    ocasion = Ocasion(**datos.model_dump())
    db.add(ocasion)
    db.commit()
    db.refresh(ocasion)
    return ocasion


@router.put("/{ocasion_id}", response_model = OcasionRead)
def actualizar(ocasion_id: int, datos: OcasionCreate, db: Session = Depends(get_db)):
    ocasion = db.query(Ocasion).filter(Ocasion.id == ocasion_id).first()
    if not ocasion:
        raise HTTPException(status_code=404, detail="Ocasion no encontrada")
    for campo, valor in datos.model_dump().items():
        setattr(ocasion, campo, valor)
    db.commit()
    db.refresh(ocasion)
    return ocasion


@router.delete("/{ocasion_id}")
def eliminar(ocasion_id: int, db: Session = Depends(get_db)):
    ocasion = db.query(Ocasion).filter(Ocasion.id == ocasion_id).first()
    if not ocasion:
        raise HTTPException(status_code=404, detail="Ocasion no encontrada")
    db.delete(ocasion)
    db.commit()
    return {"mensaje": "Ocasion eliminada"}
