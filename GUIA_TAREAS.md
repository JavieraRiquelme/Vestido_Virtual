# Tareas del Proyecto Closy 🐙

---

## Ana — Core, Servicios y Supabase

### Antes de empezar
```bash
git checkout main
git pull origin main
git checkout -b ana/auth-y-cors
```

---

### Tarea 1 — CORS en main.py

Archivo: `backend/app/api/routes/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    usuarios, prendas, categorias, ocasiones,
    outfits, clima, estilos, recomendaciones, sugerencias,
)

app = FastAPI(title="Closy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://tu-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router,        prefix="/usuarios",        tags=["usuarios"])
app.include_router(prendas.router,         prefix="/prendas",         tags=["prendas"])
app.include_router(categorias.router,      prefix="/categorias",      tags=["categorias"])
app.include_router(ocasiones.router,       prefix="/ocasiones",       tags=["ocasiones"])
app.include_router(outfits.router,         prefix="/outfits",         tags=["outfits"])
app.include_router(clima.router,           prefix="/clima",           tags=["clima"])
app.include_router(estilos.router,         prefix="/estilos",         tags=["estilos"])
app.include_router(recomendaciones.router, prefix="/recomendaciones", tags=["recomendaciones"])
app.include_router(sugerencias.router,     prefix="/sugerencias",     tags=["sugerencias"])
```

---

### Tarea 2 — JWT en config.py

Archivo: `backend/app/core/config.py`

Agregar dentro de la clase `Settings`:

```python
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "clave-local-cambiar-en-produccion")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_MINUTES: int = 1440
```

---

### Tarea 3 — Crear auth_service.py

Archivo nuevo: `backend/app/services/auth_service.py`

```python
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    return pwd_context.verify(password_plano, password_hasheado)

def crear_token(datos: dict) -> str:
    datos_token = datos.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    datos_token.update({"exp": expiracion})
    return jwt.encode(datos_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verificar_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
```

Agregar al final de `backend/requirements.txt`:

```
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
```

Instalar:

```bash
pip install passlib[bcrypt] python-jose[cryptography]
```

---

### Tarea 4 — Limpiar clima.py

Archivo: `backend/app/services/clima.py`

Borrar desde la línea 83 hasta el final (la función `sugerir_outfit` y todo lo que sigue).

---

### Tarea 5 — Conectar Supabase

1. Ir a supabase.com → **New Project** → nombre: `closy` → región: South America → guardar la contraseña
2. Esperar ~2 minutos
3. Ir a **Settings → API** → copiar `Project URL` y `anon public key`
4. Ir a **Settings → Database → Connection string → URI** → copiar y reemplazar `[password]`
5. Abrir el archivo `.env` y rellenar:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:tucontraseña@db.xxxx.supabase.co:5432/postgres
```

6. Pasar el `DATABASE_URL` a Cata y a Javiera

---

### Al terminar
```bash
git add .
git commit -m "Agregar CORS, JWT config y auth service"
git push origin ana/auth-y-cors
```
Crear Pull Request en GitHub y avisarle a las compañeras.

---
---

## Javiera — Rutas, Schemas y Render

### Antes de empezar
```bash
git checkout main
git pull origin main
git checkout -b javiera/auth-routes-render
```

---

### Tarea 1 — Crear auth.py

Archivo nuevo: `backend/app/api/routes/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario
from app.services.auth_service import hashear_password, verificar_password, crear_token
from pydantic import BaseModel, EmailStr

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    nombre: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(datos: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(
        (Usuario.username == datos.username) | (Usuario.email == datos.email)
    ).first():
        raise HTTPException(status_code=400, detail="Username o email ya en uso")
    usuario = Usuario(
        username=datos.username,
        email=datos.email,
        nombre=datos.nombre,
        contraseña_hash=hashear_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}

@router.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == datos.username).first()
    if not usuario or not verificar_password(datos.password, usuario.contraseña_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}
```

---

### Tarea 2 — Registrar auth en main.py

Archivo: `backend/app/api/routes/main.py`

Agregar en los imports:
```python
from app.api.routes import auth
```

Agregar junto a los otros routers:
```python
app.include_router(auth.router, prefix="/auth", tags=["auth"])
```

---

### Tarea 3 — Fix bug en schema de clima

Archivo: `backend/app/schemas/clima.py`

```python
# Cambiar esto:
temperatura: int | None

# Por esto:
temperatura: float | None
```

---

### Tarea 4 — Agregar response_model a todos los endpoints

Ejemplo para `prendas.py` — repetir lo mismo en `usuarios.py`, `categorias.py`, `ocasiones.py`, `outfits.py`, `estilos.py` y `recomendaciones.py`:

```python
# Agregar el schema Read al import:
from app.schemas.prenda import PrendaCreate, PrendaRead

# Agregar response_model a cada endpoint:
@router.get("/", response_model=list[PrendaRead])
@router.get("/{prenda_id}", response_model=PrendaRead)
@router.post("/", response_model=PrendaRead)
@router.put("/{prenda_id}", response_model=PrendaRead)
@router.delete("/{prenda_id}")   # este no necesita response_model
```

---

### Tarea 5 — Crear Procfile

Archivo nuevo: `backend/Procfile` (sin extensión, exactamente así):

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### Tarea 6 — Deploy en Render

1. Ir a render.com → login con GitHub → **New → Web Service**
2. Conectar el repo `Vestido_Virtual`
3. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. En **Environment** agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | el que pasa Ana |
| `SUPABASE_URL` | el que pasa Ana |
| `SUPABASE_KEY` | el que pasa Ana |
| `OPENWEATHER_API_KEY` | el del equipo |
| `JWT_SECRET_KEY` | generar en generate-secret.vercel.app/32 |
| `DEBUG` | `False` |

5. Clic en **Create Web Service**
6. Guardar la URL que entrega Render (ej: `https://closy-backend.onrender.com`) y pasársela a Ana y al frontend

---

### Al terminar
```bash
git add .
git commit -m "Agregar rutas de auth, fix schema clima, response_model y Procfile"
git push origin javiera/auth-routes-render
```
Crear Pull Request en GitHub y avisarle a las compañeras.

---
---

## Cata — Modelos y Base de Datos

### Antes de empezar
```bash
git checkout main
git pull origin main
git checkout -b cata/modelos-y-db
```

> ⚠️ Espera a que Ana configure Supabase y te pase el `DATABASE_URL` antes de correr las migraciones.

---

### Tarea 1 — Startup automático de tablas

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

### Tarea 2 — Instalar y configurar Alembic

```bash
pip install alembic
echo "alembic>=1.13.0" >> requirements.txt

# Dentro de backend/
alembic init alembic
```

Abrir `backend/alembic/env.py`, buscar la línea `target_metadata = None` y reemplazar ese bloque por:

```python
from app.models.models import Base
from app.core.config import settings

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

Crear y aplicar la primera migración (requiere el `DATABASE_URL` de Ana en el `.env`):

```bash
alembic revision --autogenerate -m "Crear tablas iniciales"
alembic upgrade head
```

---

### Tarea 3 — Script de datos iniciales

Archivo nuevo: `database/seeds/seed.py`

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
print("Seeds cargados correctamente.")
```

Ejecutar desde la raíz del proyecto:

```bash
python database/seeds/seed.py
```

---

### Al terminar
```bash
git add .
git commit -m "Agregar startup de tablas, Alembic y seed script"
git push origin cata/modelos-y-db
```
Crear Pull Request en GitHub y avisarle a las compañeras.
