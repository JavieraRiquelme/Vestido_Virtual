from sqlalchemy import Column, Integer, String, Float, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    password = Column(String(100), nullable=False)
    
    prendas = relationship("Prenda", back_populates="dueno")

class Prenda(Base):
    __tablename__ = "prendas"
    id = Column(Integer, primary_key=True, index=True)
    imagen_path = Column(String(255), nullable=False)
    temperatura = Column(Float)
    humedad = Column(Float)
    descripcion_clima = Column(String(100))
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    dueno = relationship("Usuario", back_populates="prendas")

engine = create_engine("sqlite:///./datos_fastapi.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
