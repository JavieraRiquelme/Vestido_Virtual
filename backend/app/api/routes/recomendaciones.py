from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.recomendacion import RecomendacionCreate, RecomendacionRead
from app.core.database import get_db
from app.models.models import Recomendacion

router = APIRouter()


@router.get("/", response_model=list[RecomendacionRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Recomendacion).all()


@router.get("/{recomendacion_id}", response_model=RecomendacionRead)
def obtener(recomendacion_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recomendacion).filter(Recomendacion.id == recomendacion_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")
    return rec


@router.get("/usuario/{usuario_id}", response_model=list[RecomendacionRead])
def listar_por_usuario(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Recomendacion).filter(Recomendacion.usuario_id == usuario_id).all()


@router.post("/", response_model=RecomendacionRead)
def crear(datos: RecomendacionCreate, db: Session = Depends(get_db)):
    rec = Recomendacion(**datos.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/{recomendacion_id}/rating", response_model=RecomendacionRead)
def calificar(recomendacion_id: int, rating: int, db: Session = Depends(get_db)):
    rec = db.query(Recomendacion).filter(Recomendacion.id == recomendacion_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating debe estar entre 1 y 5")
    rec.rating_usuario = rating
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{recomendacion_id}")
def eliminar(recomendacion_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recomendacion).filter(Recomendacion.id == recomendacion_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendacion no encontrada")
    db.delete(rec)
    db.commit()
    return {"mensaje": "Recomendacion eliminada"}
