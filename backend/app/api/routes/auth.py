from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.models.models import Usuario 
from app.services.auth_service import hashear_password, verificar_password, crear_token

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    email: str
    nombre: str 
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(datos: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(
        (Usuario.username == datos.username) | (Usuario.email == datos.email)
    ).first():
        raise HTTPException(status_code=400, detail="Username o email ya en uso")
    
    usuario = Usuario(
        username = datos.username,
        email = datos.email,
        nombre = datos.nombre,
        contraseña_hash = hashear_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh()
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}

@router.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == datos.username).first()

    if not usuario or not verificar_password(datos.password, usuario.contraseña_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}