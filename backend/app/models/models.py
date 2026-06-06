from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Usuario(BaseModel):
    id: Optional[str] = None
    email: str
    nombre: str
    username: str
    age: int
    fecha_registro: datetime
    class Config:
        from_attributes = True

class Prenda(BaseModel):
    id: Optional[str] = None
    usuario_id: str
    nombre: str
    categoria: str
    clima_adecuado: str
    imagen_url: str
class Config:
        from_attributes = True
        
class Outfit(BaseModel):
    id: Optional[str] = None
    usuario_id: str
    prenda_1_id: str
    prenda_2_id: str
    prenda_3_id: str
    ocasion: str
    clima_adecuado: str
class Config:
        from_attributes = True

class Clima(BaseModel):
    id: Optional[str] = None
    ciudad: str
    temperatura: float
    descripcion: str
    fecha: datetime
    class Config:
        from_attributes = True
