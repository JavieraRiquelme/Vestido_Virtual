from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.prenda import PrendaCreate
from app.core.database import get_db
from app.models.models import Prenda
from app.schemas.prenda import PrendaCreate, PrendaRead

router = APIRouter()


@router.get("/", response_model=list[PrendaRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Prenda).all()


@router.get("/{prenda_id}", response_model=PrendaRead)
def obtener(prenda_id: int, db: Session = Depends(get_db)):
    prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    return prenda


@router.get("/usuario/{usuario_id}", response_model=list[PrendaRead])
def listar_por_usuario(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Prenda).filter(Prenda.usuario_id == usuario_id).all()


@router.post("/", response_model=PrendaRead)
def crear(datos: PrendaCreate, db: Session = Depends(get_db)):
    prenda = Prenda(**datos.model_dump())
    db.add(prenda)
    db.commit()
    db.refresh(prenda)
    return prenda


@router.put("/{prenda_id}", response_model=PrendaRead)
def actualizar(prenda_id: int, datos: PrendaCreate, db: Session = Depends(get_db)):
    prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    for campo, valor in datos.model_dump().items():
        setattr(prenda, campo, valor)
    db.commit()
    db.refresh(prenda)
    return prenda


@router.delete("/{prenda_id}")
def eliminar(prenda_id: int, db: Session = Depends(get_db)):
    prenda = db.query(Prenda).filter(Prenda.id == prenda_id).first()
    if not prenda:
        raise HTTPException(status_code=404, detail="Prenda no encontrada")
    db.delete(prenda)
    db.commit()
    return {"mensaje": "Prenda eliminada"}
