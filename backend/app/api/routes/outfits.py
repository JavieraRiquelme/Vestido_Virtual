from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.outfit import OutfitCreate, OutfitRead
from app.schemas.prenda import PrendaRead
from app.core.database import get_db
from app.models.models import Outfit, OutfitPrenda, Prenda

router = APIRouter()


@router.get("/", response_model=list[OutfitRead])
def listar(db: Session = Depends(get_db)):
    return db.query(Outfit).all()


@router.get("/{outfit_id}", response_model=OutfitRead)
def obtener(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit no encontrado")
    return outfit


@router.get("/usuario/{usuario_id}", response_model=list[OutfitRead])
def listar_por_usuario(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Outfit).filter(Outfit.usuario_id == usuario_id).all()


@router.post("/", response_model=OutfitRead)
def crear(datos: OutfitCreate, db: Session = Depends(get_db)):
    outfit = Outfit(**datos.model_dump())
    db.add(outfit)
    db.commit()
    db.refresh(outfit)
    return outfit


@router.put("/{outfit_id}", response_model=OutfitRead)
def actualizar(outfit_id: int, datos: OutfitCreate, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit no encontrado")
    for campo, valor in datos.model_dump().items():
        setattr(outfit, campo, valor)
    db.commit()
    db.refresh(outfit)
    return outfit


@router.delete("/{outfit_id}")
def eliminar(outfit_id: int, db: Session = Depends(get_db)):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit no encontrado")
    db.delete(outfit)
    db.commit()
    return {"mensaje": "Outfit eliminado"}


@router.get("/{outfit_id}/prendas", response_model=list[PrendaRead])
def listar_prendas_de_outfit(outfit_id: int, db: Session = Depends(get_db)):
    prendas = (
        db.query(Prenda)
        .join(OutfitPrenda, OutfitPrenda.prenda_id == Prenda.id)
        .filter(OutfitPrenda.outfit_id == outfit_id)
        .all()
    )
    return prendas


@router.post("/{outfit_id}/prendas/{prenda_id}")
def agregar_prenda(outfit_id: int, prenda_id: int, rol: str = None, db: Session = Depends(get_db)):
    relacion = OutfitPrenda(outfit_id=outfit_id, prenda_id=prenda_id, rol=rol)
    db.add(relacion)
    db.commit()
    db.refresh(relacion)
    return relacion


@router.delete("/{outfit_id}/prendas/{prenda_id}")
def quitar_prenda(outfit_id: int, prenda_id: int, db: Session = Depends(get_db)):
    relacion = db.query(OutfitPrenda).filter(
        OutfitPrenda.outfit_id == outfit_id,
        OutfitPrenda.prenda_id == prenda_id
    ).first()
    if not relacion:
        raise HTTPException(status_code=404, detail="Relacion no encontrada")
    db.delete(relacion)
    db.commit()
    return {"mensaje": "Prenda quitada del outfit"}
