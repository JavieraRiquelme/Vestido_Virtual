from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class UsuarioCreate(BaseModel):
    username: str
    email: EmailStr
    nombre: str
    contraseña_hash: str
    age: int | None = None


class UsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    nombre: str
    age: int | None
    created_at: datetime
