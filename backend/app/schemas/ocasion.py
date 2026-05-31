from pydantic import BaseModel, ConfigDict


class OcasionCreate(BaseModel):
    nombre: str
    descripcion: str | None = None


class OcasionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
