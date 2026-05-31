from pydantic import BaseModel, ConfigDict


class EstiloUsuarioCreate(BaseModel):
    usuario_id: int
    ocasion_id: int
    colores_favoritos: str | None = None
    preferencias: str | None = None


class EstiloUsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    ocasion_id: int
    colores_favoritos: str | None
    preferencias: str | None
