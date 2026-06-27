from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import uuid, hashlib
import resend
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Usuario, PasswordResetToken
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

class SolicitarResetRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    nueva_password: str

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
        password_hash = hashear_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}

@router.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == datos.username).first()

    if not usuario or not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}


@router.post("/solicitar-reset")
def solicitar_reset(datos: SolicitarResetRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    # Respuesta genérica siempre — no revelar si el email existe
    if not usuario:
        return {"mensaje": "Si el email está registrado, recibirás un enlace."}

    # Invalidar tokens previos del usuario
    db.query(PasswordResetToken).filter(
        PasswordResetToken.usuario_id == usuario.id,
        PasswordResetToken.used == False
    ).update({"used": True})

    raw_token = str(uuid.uuid4())
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    reset = PasswordResetToken(
        usuario_id = usuario.id,
        token_hash = token_hash,
        expires_at = datetime.utcnow() + timedelta(hours=1),
    )
    db.add(reset)
    db.commit()

    link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#262628;">Recupera tu contraseña</h2>
      <p style="color:#5a5a5c;">Hola <strong>{usuario.nombre}</strong>, recibimos una solicitud para restablecer tu contraseña de Klosy.</p>
      <a href="{link}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#262628;color:#FFF6EE;border-radius:50px;text-decoration:none;font-weight:700;">
        Cambiar contraseña
      </a>
      <p style="color:#9a9a9c;font-size:0.85rem;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.</p>
    </div>
    """

    if settings.RESEND_API_KEY:
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from":    settings.FROM_EMAIL,
            "to":      [usuario.email],
            "subject": "Recupera tu contraseña de Klosy",
            "html":    html,
        })

    return {"mensaje": "Si el email está registrado, recibirás un enlace."}


@router.post("/reset-password")
def reset_password(datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(datos.token.encode()).hexdigest()

    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used       == False,
        PasswordResetToken.expires_at >  datetime.utcnow(),
    ).first()

    if not reset:
        raise HTTPException(status_code=400, detail="Enlace inválido o expirado")

    if len(datos.nueva_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    usuario = db.query(Usuario).filter(Usuario.id == reset.usuario_id).first()
    usuario.password_hash = hashear_password(datos.nueva_password)
    reset.used = True
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}