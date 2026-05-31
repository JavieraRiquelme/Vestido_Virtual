from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RecomendacionCreate(BaseModel):
    usuario_id: int
    ocasion_id: int
    clima_id: int
    outfit_id: int
    destino: str | None = None
    detalle: str | None = None
    rating_usuario: int | None = None


class RecomendacionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    ocasion_id: int
    clima_id: int
    outfit_id: int
    destino: str | None
    detalle: str | None
    rating_usuario: int | None
    created_at: datetime
