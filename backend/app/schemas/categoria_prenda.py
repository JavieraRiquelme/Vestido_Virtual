from pydantic import BaseModel, ConfigDict


class CategoriaPrendaCreate(BaseModel):
    nombre: str
    rol: str | None = None


class CategoriaPrendaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    rol: str | None
