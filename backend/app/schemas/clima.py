from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ClimaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ciudad: str
    pais: str | None
    temperatura: float | None
    categoria: str | None
    descripcion: str | None
    consultado_at: datetime
