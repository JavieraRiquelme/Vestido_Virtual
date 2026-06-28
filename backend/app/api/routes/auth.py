from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from supabase import create_client

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Usuario

router = APIRouter()


class SyncRequest(BaseModel):
    nombre:   str | None = None
    username: str | None = None


def _verificar_token_supabase(token: str):
    try:
        sb  = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        res = sb.auth.get_user(token)
        if not res.user:
            raise HTTPException(status_code=401, detail="Token inválido")
        return res.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/supabase-sync")
def supabase_sync(datos: SyncRequest, request: Request, db: Session = Depends(get_db)):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido")

    sb_user  = _verificar_token_supabase(auth[7:])
    email    = sb_user.email
    metadata = sb_user.user_metadata or {}

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        base = (datos.username or metadata.get("username") or email.split("@")[0])[:20]
        username = base
        n = 1
        while db.query(Usuario).filter(Usuario.username == username).first():
            username = f"{base}{n}"; n += 1

        usuario = Usuario(
            username      = username,
            email         = email,
            nombre        = datos.nombre or metadata.get("nombre") or base,
            password_hash = "__supabase__",
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

    return {"usuario_id": usuario.id, "nombre": usuario.nombre, "username": usuario.username}
