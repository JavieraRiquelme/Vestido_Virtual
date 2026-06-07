"""
Seed script — carga los datos iniciales necesarios para que la app funcione.
Ejecutar UNA SOLA VEZ después de crear las tablas.

Comando (desde la raíz del proyecto):
    python database/seeds/seed.py
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from app.core.database import SessionLocal
from app.models.models import CategoriaPrenda, Ocasion

db = SessionLocal()

categorias = [
    CategoriaPrenda(id=1, nombre="Parte de arriba (manga larga)", rol="top_largo"),
    CategoriaPrenda(id=2, nombre="Parte de arriba (manga corta)", rol="top_corto"),
    CategoriaPrenda(id=3, nombre="Parte de abajo (largo)",        rol="bottom_largo"),
    CategoriaPrenda(id=4, nombre="Parte de abajo (corto)",        rol="bottom_corto"),
    CategoriaPrenda(id=5, nombre="Zapatos",                       rol="zapatos"),
    CategoriaPrenda(id=6, nombre="Accesorios",                    rol="accesorios"),
]

ocasiones = [
    Ocasion(id=1, nombre="Universidad", descripcion="Clases y campus"),
    Ocasion(id=2, nombre="Trabajo",     descripcion="Oficina y reuniones"),
    Ocasion(id=3, nombre="Casual",      descripcion="Salidas y tiempo libre"),
]

for cat in categorias:
    if not db.query(CategoriaPrenda).filter_by(id=cat.id).first():
        db.add(cat)

for oc in ocasiones:
    if not db.query(Ocasion).filter_by(id=oc.id).first():
        db.add(oc)

db.commit()
db.close()

print("Seeds cargados correctamente.")
