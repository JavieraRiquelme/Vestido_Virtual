from pydantic import BaseModel

class PrendaCreate(BaseModel): 
    nombre: str
    categoria: str
    talla: str
    precio: float

