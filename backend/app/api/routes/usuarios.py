from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.usuario import UsuarioCreate
from app.core.database import get_db
from app.models.models import Usuario

router = APIRouter()


@router.get("/")
def listar(db: Session = Depends(get_db)):
    return db.query(Usuario).all()


@router.get("/{usuario_id}")
def obtener(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("/")
def crear(datos: UsuarioCreate, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(
        (Usuario.username == datos.username) | (Usuario.email == datos.email)
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Username o email ya en uso")
    usuario = Usuario(**datos.model_dump())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/{usuario_id}")
def actualizar(usuario_id: int, datos: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for campo, valor in datos.model_dump().items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}")
def eliminar(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}
