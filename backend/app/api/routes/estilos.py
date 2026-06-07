from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.estilo_usuario import EstiloUsuarioCreate, EstiloUsuarioRead
from app.core.database import get_db
from app.models.models import EstiloUsuario

router = APIRouter()


@router.get("/", response_model=list[EstiloUsuarioRead])
def listar(db: Session = Depends(get_db)):
    return db.query(EstiloUsuario).all()


@router.get("/{estilo_id}", response_model=EstiloUsuarioRead)
def obtener(estilo_id: int, db: Session = Depends(get_db)):
    estilo = db.query(EstiloUsuario).filter(EstiloUsuario.id == estilo_id).first()
    if not estilo:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    return estilo


@router.get("/usuario/{usuario_id}", response_model=list[EstiloUsuarioRead])
def listar_por_usuario(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(EstiloUsuario).filter(EstiloUsuario.usuario_id == usuario_id).all()


@router.post("/", response_model=EstiloUsuarioRead)
def crear(datos: EstiloUsuarioCreate, db: Session = Depends(get_db)):
    estilo = EstiloUsuario(**datos.model_dump())
    db.add(estilo)
    db.commit()
    db.refresh(estilo)
    return estilo


@router.put("/{estilo_id}", response_model=EstiloUsuarioRead)
def actualizar(estilo_id: int, datos: EstiloUsuarioCreate, db: Session = Depends(get_db)):
    estilo = db.query(EstiloUsuario).filter(EstiloUsuario.id == estilo_id).first()
    if not estilo:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    for campo, valor in datos.model_dump().items():
        setattr(estilo, campo, valor)
    db.commit()
    db.refresh(estilo)
    return estilo


@router.delete("/{estilo_id}")
def eliminar(estilo_id: int, db: Session = Depends(get_db)):
    estilo = db.query(EstiloUsuario).filter(EstiloUsuario.id == estilo_id).first()
    if not estilo:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    db.delete(estilo)
    db.commit()
    return {"mensaje": "Estilo eliminado"}
