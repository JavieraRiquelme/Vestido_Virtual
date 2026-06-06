"""
auth_service.py — Servicio de autenticación
Maneja el cifrado de contraseñas y la creación de tokens JWT.
"""
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    """Recibe la contraseña en texto plano y devuelve su versión cifrada."""
    return pwd_context.hash(password)


def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    """Compara la contraseña ingresada con el hash guardado en la base de datos."""
    return pwd_context.verify(password_plano, password_hasheado)


def crear_token(datos: dict) -> str:
    """Crea y firma un JWT con los datos del usuario."""
    datos_token = datos.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    datos_token.update({"exp": expiracion})
    return jwt.encode(datos_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verificar_token(token: str) -> dict:
    """Verifica que un JWT sea válido y devuelve los datos que contiene."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
