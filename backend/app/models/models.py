from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    contraseña_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    prendas = relationship("Prenda", back_populates="usuario")
    estilos = relationship("EstiloUsuario", back_populates="usuario")
    outfits = relationship("Outfit", back_populates="usuario")
    recomendaciones = relationship("Recomendacion", back_populates="usuario")


class CategoriaPrenda(Base):
    __tablename__ = "categorias_prenda"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    rol = Column(String(50), nullable=True)

    prendas = relationship("Prenda", back_populates="categoria")


class Prenda(Base):
    __tablename__ = "prendas"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias_prenda.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    color = Column(String(50), nullable=True)
    ideal_clima = Column(String(50), nullable=True)
    imagen_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="prendas")
    categoria = relationship("CategoriaPrenda", back_populates="prendas")


class Ocasion(Base):
    __tablename__ = "ocasiones"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(255), nullable=True)

    estilos = relationship("EstiloUsuario", back_populates="ocasion")
    outfits = relationship("Outfit", back_populates="ocasion")
    recomendaciones = relationship("Recomendacion", back_populates="ocasion")


class EstiloUsuario(Base):
    __tablename__ = "estilos_usuario"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    colores_favoritos = Column(String(255), nullable=True)
    preferencias = Column(String(255), nullable=True)

    usuario = relationship("Usuario", back_populates="estilos")
    ocasion = relationship("Ocasion", back_populates="estilos")


class Outfit(Base):
    __tablename__ = "outfits"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    ideal_clima = Column(String(50), nullable=True)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="outfits")
    ocasion = relationship("Ocasion", back_populates="outfits")
    prendas = relationship("OutfitPrenda", back_populates="outfit")
    recomendaciones = relationship("Recomendacion", back_populates="outfit")


class OutfitPrenda(Base):
    __tablename__ = "outfit_prendas"
    outfit_id = Column(Integer, ForeignKey("outfits.id"), primary_key=True)
    prenda_id = Column(Integer, ForeignKey("prendas.id"), primary_key=True)
    rol = Column(String(50), nullable=True)

    outfit = relationship("Outfit", back_populates="prendas")
    prenda = relationship("Prenda")


class Clima(Base):
    __tablename__ = "clima"
    id = Column(Integer, primary_key=True, index=True)
    ciudad = Column(String(100), nullable=False)
    pais = Column(String(10), nullable=True)
    temperatura = Column(Float, nullable=True)
    categoria = Column(String(20), nullable=True)
    descripcion = Column(String(100), nullable=True)
    consultado_at = Column(DateTime, default=datetime.utcnow)

    recomendaciones = relationship("Recomendacion", back_populates="clima")


class Recomendacion(Base):
    __tablename__ = "recomendaciones"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ocasion_id = Column(Integer, ForeignKey("ocasiones.id"), nullable=False)
    clima_id = Column(Integer, ForeignKey("clima.id"), nullable=False)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    destino = Column(String(100), nullable=True)
    detalle = Column(String(255), nullable=True)
    rating_usuario = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="recomendaciones")
    ocasion = relationship("Ocasion", back_populates="recomendaciones")
    clima = relationship("Clima", back_populates="recomendaciones")
    outfit = relationship("Outfit", back_populates="recomendaciones")
