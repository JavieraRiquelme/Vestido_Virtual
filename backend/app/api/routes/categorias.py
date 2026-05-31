from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.categoria_prenda import CategoriaPrendaCreate
from app.core.database import get_db
from app.models.models import CategoriaPrenda

router = APIRouter()


@router.get("/")
def listar(db: Session = Depends(get_db)):
    return db.query(CategoriaPrenda).all()


@router.get("/{categoria_id}")
def obtener(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaPrenda).filter(CategoriaPrenda.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return categoria


@router.post("/")
def crear(datos: CategoriaPrendaCreate, db: Session = Depends(get_db)):
    categoria = CategoriaPrenda(**datos.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/{categoria_id}")
def actualizar(categoria_id: int, datos: CategoriaPrendaCreate, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaPrenda).filter(CategoriaPrenda.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    for campo, valor in datos.model_dump().items():
        setattr(categoria, campo, valor)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}")
def eliminar(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(CategoriaPrenda).filter(CategoriaPrenda.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    db.delete(categoria)
    db.commit()
    return {"mensaje": "Categoria eliminada"}
