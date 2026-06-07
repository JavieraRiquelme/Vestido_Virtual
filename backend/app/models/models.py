from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"

    id               = Column(Integer, primary_key=True, index=True)
    username         = Column(String, unique=True, nullable=False)
    email            = Column(String, unique=True, nullable=False)
    nombre           = Column(String, nullable=False)
    contraseña_hash  = Column(String, nullable=False)
    age              = Column(Integer, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)


class CategoriaPrenda(Base):
    __tablename__ = "categorias_prenda"

    id     = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    rol    = Column(String, nullable=True)


class Ocasion(Base):
    __tablename__ = "ocasiones"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)


class Prenda(Base):
    __tablename__ = "prendas"

    id          = Column(Integer, primary_key=True, index=True)
    usuario_id  = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias_prenda.id"), nullable=False)
    nombre      = Column(String, nullable=False)
    color       = Column(String, nullable=True)
    ideal_clima = Column(String, nullable=True)
    imagen_url  = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class Outfit(Base):
    __tablename__ = "outfits"

    id          = Column(Integer, primary_key=True, index=True)
    usuario_id  = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id  = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    nombre      = Column(String, nullable=False)
    ideal_clima = Column(String, nullable=True)
    rating      = Column(Float, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class OutfitPrenda(Base):
    __tablename__ = "outfits_prendas"

    id        = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    prenda_id = Column(Integer, ForeignKey("prendas.id"), nullable=False)
    rol       = Column(String, nullable=True)


class Clima(Base):
    __tablename__ = "clima"

    id            = Column(Integer, primary_key=True, index=True)
    ciudad        = Column(String, nullable=False)
    pais          = Column(String, nullable=True)
    temperatura   = Column(Float, nullable=True)
    categoria     = Column(String, nullable=True)
    descripcion   = Column(String, nullable=True)
    consultado_at = Column(DateTime, default=datetime.utcnow)


class EstiloUsuario(Base):
    __tablename__ = "estilos_usuario"

    id                = Column(Integer, primary_key=True, index=True)
    usuario_id        = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id        = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    colores_favoritos = Column(String, nullable=True)
    preferencias      = Column(Text, nullable=True)


class Recomendacion(Base):
    __tablename__ = "recomendaciones"

    id             = Column(Integer, primary_key=True, index=True)
    usuario_id     = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id     = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    clima_id       = Column(Integer, ForeignKey("clima.id"), nullable=False)
    outfit_id      = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    destino        = Column(String, nullable=True)
    detalle        = Column(Text, nullable=True)
    rating_usuario = Column(Integer, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
