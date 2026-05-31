from pydantic import BaseModel, ConfigDict
from datetime import datetime


class OutfitCreate(BaseModel):
    usuario_id: int
    ocasion_id: int
    nombre: str
    ideal_clima: str | None = None
    rating: float | None = None


class OutfitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    ocasion_id: int
    nombre: str
    ideal_clima: str | None
    rating: float | None
    created_at: datetime
