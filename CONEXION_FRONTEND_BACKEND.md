# Conectar Frontend y Backend 🐙

Para que la app funcione localmente necesitan completar estas tareas **en orden**.

---

## Orden de trabajo

```
1. Ana  → CORS
2. Cata → Tablas + Seeds + Usuario de prueba
3. Javiera → URL del backend en el frontend
4. Todas → probar juntas
```

---

## Ana 🟣

### Tarea 1 — Agregar CORS

Archivo: `backend/app/api/routes/main.py`

Agregar después de crear el `app`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Guardar, commitear y pushear:

```bash
git add .
git commit -m "Agregar CORS para conexión con frontend"
git push origin ana/auth-y-cors
```

Avisar a Cata que puede seguir.

---

## Cata 🟢

### Tarea 1 — Crear las tablas al arrancar el servidor

Archivo: `backend/main.py`

```python
from app.api.routes.main import app
from app.models.models import Base
from app.core.database import engine


@app.on_event("startup")
def crear_tablas():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

### Tarea 2 — Cargar datos iniciales (categorías y ocasiones)

Archivo: `database/seeds/seed.py`

```python
import sys, os
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
print("Seeds cargados.")
```

Ejecutar desde la raíz del proyecto:

```bash
python database/seeds/seed.py
```

---

### Tarea 3 — Crear un usuario de prueba

1. Arrancar el backend:
```bash
cd backend
uvicorn main:app --reload
```

2. Abrir en el navegador: `http://localhost:8000/docs`
3. Buscar el endpoint `POST /usuarios/`
4. Hacer clic en **Try it out**
5. Pegar este JSON y ejecutar:

```json
{
  "username": "usuarioprueba",
  "email": "prueba@closy.com",
  "nombre": "Usuario Prueba",
  "contraseña_hash": "1234"
}
```

6. Verificar que la respuesta muestre `"id": 1`

Commitear y pushear:

```bash
git add .
git commit -m "Agregar startup de tablas y seed script"
git push origin cata/modelos-y-db
```

Avisar a Javiera que puede seguir.

---

## Javiera 🔵

### Tarea 1 — Apuntar el frontend al backend

Verificar que existe el archivo `frontend/.env.local`. Si no existe, crearlo:

```bash
echo "VITE_API_URL=http://localhost:8000" > frontend/.env.local
```

---

### Tarea 2 — Probar que todo conecta

1. Arrancar el backend (en una terminal):
```bash
cd backend
uvicorn main:app --reload
```

2. Arrancar el frontend (en otra terminal):
```bash
cd frontend
npm run dev
```

3. Abrir `http://localhost:5173` en el navegador
4. Ir a **Recomendaciones** → seleccionar temperatura, condiciones y ocasión → clic en **Armar outfit**
5. Verificar que devuelve una respuesta (aunque sea vacía, no debe dar error de red)
6. Ir a **Mis Outfits** → verificar que carga sin errores

---

## Si algo falla 🔍

| Error en el navegador | Causa | Quién lo arregla |
|----------------------|-------|------------------|
| `CORS error` | CORS no está configurado | Ana |
| `Failed to fetch` | El backend no está corriendo | Verificar que `uvicorn` esté activo |
| `relation does not exist` | Las tablas no se crearon | Cata (tarea 1) |
| `404 Not Found` | La URL del backend es incorrecta | Javiera (verificar `.env.local`) |
| Respuesta vacía en sugerencias | No hay prendas del usuario | Normal por ahora, el usuario de prueba no tiene prendas aún |
