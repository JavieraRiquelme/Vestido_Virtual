# Guía del Proyecto Closy 🐙

---

## Índice

1. [¿Cómo está organizado el proyecto?](#1-cómo-está-organizado-el-proyecto)
2. [Setup inicial (hacer una sola vez)](#2-setup-inicial-hacer-una-sola-vez)
3. [Cómo trabajar en equipo con Git](#3-cómo-trabajar-en-equipo-con-git)
4. [Tareas de Ana — Core, Servicios y Supabase](#4-tareas-de-ana--core-servicios-y-supabase)
5. [Tareas de Javiera — Rutas, Schemas y Render](#5-tareas-de-javiera--rutas-schemas-y-render)
6. [Tareas de Cata — Modelos y Base de Datos](#6-tareas-de-cata--modelos-y-base-de-datos)
7. [Cómo conectar Supabase](#7-cómo-conectar-supabase)
8. [Cómo hacer deploy en Render](#8-cómo-hacer-deploy-en-render)
9. [Cómo hacer deploy en Vercel](#9-cómo-hacer-deploy-en-vercel)
10. [Comandos útiles de referencia](#10-comandos-útiles-de-referencia)
11. [Glosario](#11-glosario)

---

## 1. ¿Cómo está organizado el proyecto?

```
Vestido_Virtual/
├── backend/               ← API en Python (FastAPI) → se despliega en Render
│   ├── main.py            ← punto de entrada, acá arranca el servidor
│   ├── requirements.txt   ← lista de librerías Python necesarias
│   └── app/
│       ├── api/routes/    ← los endpoints (URLs) de la API
│       ├── models/        ← la forma de las tablas en la base de datos
│       ├── schemas/       ← la forma de los datos que entran y salen
│       ├── services/      ← la lógica de negocio
│       └── core/          ← configuración y conexión a la base de datos
│
├── frontend/              ← App React → se despliega en Vercel
│   ├── package.json       ← lista de librerías JavaScript necesarias
│   └── src/
│       ├── App.jsx        ← rutas del frontend
│       ├── pages/         ← pantallas de la app
│       ├── components/    ← piezas reutilizables
│       └── services/      ← llamadas a la API del backend
│
├── database/              ← migraciones y datos iniciales
└── .env.example           ← plantilla de variables de entorno
```

**Flujo general:** El frontend (React) le habla al backend (FastAPI), que a su vez lee y guarda datos en la base de datos (Supabase/PostgreSQL).

---

## 2. Setup inicial (hacer una sola vez)

### Clonar el repositorio

```bash
git clone https://github.com/JavieraRiquelme/Vestido_Virtual.git
cd Vestido_Virtual
```

### Configurar y correr el backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
# Abre el .env y rellena los valores reales
uvicorn main:app --reload
```

Si todo está bien verás: `Uvicorn running on http://127.0.0.1:8000`

Abre `http://localhost:8000/docs` en el navegador para ver todos los endpoints.

### Configurar y correr el frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Si todo está bien verás: `➜ Local: http://localhost:5173/`

---

## 3. Cómo trabajar en equipo con Git

La regla más importante: **nunca trabajen directamente en `main`**. Siempre creen una rama para su trabajo.

### Flujo de trabajo diario

```bash
# 1. Antes de empezar, actualiza tu código
git checkout main
git pull origin main

# 2. Crea tu rama
git checkout -b ana/agregar-cors

# 3. Trabajas en tu código...

# 4. Guardas tus cambios
git add .
git commit -m "Agregar configuración de CORS"

# 5. Subes tu rama
git push origin ana/agregar-cors
```

### Para integrar a main

1. Ve a GitHub → aparecerá un botón "Compare & pull request"
2. Crea el Pull Request describiendo qué hiciste
3. Pídele a una compañera que lo revise
4. Una vez aprobado, se hace merge a main

### Convención de nombres de ramas

```
ana/nombre-de-la-tarea
javiera/nombre-de-la-tarea
cata/nombre-de-la-tarea
```

---

## 4. Tareas de Ana — Core, Servicios y Supabase

📁 **Archivos que te tocan:**
- `backend/app/api/routes/main.py`
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/services/auth_service.py` ← crear desde cero
- `backend/app/services/clima.py`

🌿 **Tu rama:** `git checkout -b ana/auth-y-cors`

---

### Tarea 1 — Agregar CORS

CORS le permite al frontend en Vercel hablar con el backend en Render. Sin esto el navegador bloquea todo.

Abre `backend/app/api/routes/main.py` y agrega el middleware:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    usuarios, prendas, categorias, ocasiones,
    outfits, clima, estilos, recomendaciones, sugerencias,
)

app = FastAPI(title="Closy API")

# Agregar esto:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://tu-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... el resto queda igual
```

> Cuando Vercel te dé la URL real, reemplaza `"https://tu-app.vercel.app"` por esa URL.

---

### Tarea 2 — Agregar JWT_SECRET_KEY a la configuración

Abre `backend/app/core/config.py` y agrega dentro de la clase `Settings`:

```python
# Autenticación
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "clave-local-cambiar-en-produccion")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_MINUTES: int = 1440  # 24 horas
```

---

### Tarea 3 — Crear el servicio de autenticación

Crea el archivo `backend/app/services/auth_service.py`:

```python
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    """Convierte una contraseña en texto a su versión hasheada (segura)."""
    return pwd_context.hash(password)


def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    """Verifica que una contraseña coincida con su hash."""
    return pwd_context.verify(password_plano, password_hasheado)


def crear_token(datos: dict) -> str:
    """Crea un token JWT con los datos del usuario."""
    datos_token = datos.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    datos_token.update({"exp": expiracion})
    return jwt.encode(datos_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verificar_token(token: str) -> dict:
    """Verifica y decodifica un token JWT. Lanza excepción si es inválido."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
```

Agrega al `backend/requirements.txt`:

```
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
```

Instálalas:

```bash
pip install passlib[bcrypt] python-jose[cryptography]
```

---

### Tarea 4 — Limpiar código muerto en clima.py

Abre `backend/app/services/clima.py` y borra la función `sugerir_outfit` desde la línea 83 hasta el final del archivo. Esa lógica ya existe en `sugerir_outfit.py` y nunca se llama desde `clima.py`.

---

### Tarea 5 — Conectar Supabase

Ver la [sección 7](#7-cómo-conectar-supabase) para los pasos detallados. Una vez que tengas las credenciales, rellena el `.env`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:tucontraseña@db.xxxx.supabase.co:5432/postgres
```

> Pásale el `DATABASE_URL` a Cata (para las migraciones) y a Javiera (para Render).

---

## 5. Tareas de Javiera — Rutas, Schemas y Render

📁 **Archivos que te tocan:**
- `backend/app/api/routes/auth.py` ← crear desde cero
- `backend/app/api/routes/main.py`
- `backend/app/api/routes/` ← todos los demás (response_model)
- `backend/app/schemas/clima.py`
- `backend/Procfile` ← crear desde cero

🌿 **Tu rama:** `git checkout -b javiera/auth-routes-render`

---

### Tarea 1 — Crear las rutas de autenticación

Crea `backend/app/api/routes/auth.py`:

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

Registra el router en `backend/app/api/routes/main.py`:

```python
from app.api.routes import auth  # agregar en los imports

app.include_router(auth.router, prefix="/auth", tags=["auth"])  # agregar junto a los otros
```

---

### Tarea 2 — Corregir el schema de clima

Abre `backend/app/schemas/clima.py` y cambia:

```python
# Antes (incorrecto):
temperatura: int | None

# Después (correcto):
temperatura: float | None
```

---

### Tarea 3 — Agregar response_model a los endpoints

Los `response_model` le dicen a FastAPI exactamente qué forma tiene cada respuesta. Ejemplo para `prendas.py` — repite la misma lógica para cada archivo de rutas:

```python
from app.schemas.prenda import PrendaCreate, PrendaRead  # agregar PrendaRead

@router.get("/", response_model=list[PrendaRead])         # agregar response_model
def listar(db: Session = Depends(get_db)):
    ...

@router.get("/{prenda_id}", response_model=PrendaRead)    # agregar response_model
def obtener(prenda_id: int, db: Session = Depends(get_db)):
    ...

@router.post("/", response_model=PrendaRead)              # agregar response_model
def crear(datos: PrendaCreate, db: Session = Depends(get_db)):
    ...

@router.put("/{prenda_id}", response_model=PrendaRead)    # agregar response_model
def actualizar(prenda_id: int, datos: PrendaCreate, db: Session = Depends(get_db)):
    ...
```

Repite esto para: `usuarios.py`, `categorias.py`, `ocasiones.py`, `outfits.py`, `estilos.py`, `recomendaciones.py`.

---

### Tarea 4 — Crear el Procfile para Render

Crea el archivo `backend/Procfile` (sin extensión) con exactamente esto:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### Tarea 5 — Deploy en Render

Ver la [sección 8](#8-cómo-hacer-deploy-en-render) para los pasos detallados.

---

## 6. Tareas de Cata — Modelos y Base de Datos

📁 **Archivos que te tocan:**
- `backend/main.py`
- `backend/app/models/models.py`
- `backend/alembic/` ← configurar desde cero
- `database/seeds/seed.py` ← crear desde cero

🌿 **Tu rama:** `git checkout -b cata/modelos-y-db`

> ⚠️ Tus tareas dependen de que Ana configure Supabase primero. Espera a que te pase el `DATABASE_URL` antes de correr las migraciones.

---

### Tarea 1 — Inicialización automática de tablas

Abre `backend/main.py` y déjalo así:

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

Esto hace que cada vez que el servidor arranque, cree las tablas automáticamente si no existen.

---

### Tarea 2 — Configurar Alembic (migraciones)

Alembic es la herramienta para hacer cambios controlados en la estructura de la base de datos.

```bash
# Instalar
pip install alembic
echo "alembic>=1.13.0" >> requirements.txt

# Inicializar dentro de backend/
cd backend
alembic init alembic
```

Abre `backend/alembic/env.py`, busca la línea `target_metadata = None` y reemplaza ese bloque por:

```python
from app.models.models import Base
from app.core.config import settings

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

Crea y aplica la primera migración:

```bash
# Dentro de backend/
alembic revision --autogenerate -m "Crear tablas iniciales"
alembic upgrade head
```

Las tablas aparecerán en Supabase bajo **Table Editor**.

---

### Tarea 3 — Script de datos iniciales (seeds)

Las categorías y ocasiones son datos que necesitan existir antes de que la app funcione. Crea `database/seeds/seed.py`:

```python
"""
Ejecutar una sola vez para poblar las tablas de datos iniciales.
Uso: python database/seeds/seed.py  (desde la raíz del proyecto)
"""
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

Para ejecutarlo:

```bash
# Desde la raíz del proyecto
python database/seeds/seed.py
```

---

## 7. Cómo conectar Supabase

### Paso 1 — Crear el proyecto

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Clic en **New Project**
3. Ponle nombre: `closy`
4. Elige región: **South America**
5. Escribe una contraseña segura para la base de datos y **guárdala**
6. Espera ~2 minutos

### Paso 2 — Obtener las credenciales

**Para `SUPABASE_URL` y `SUPABASE_KEY`:**
- Ve a **Settings → API**
- Copia `Project URL` → es tu `SUPABASE_URL`
- Copia `anon public` key → es tu `SUPABASE_KEY`

**Para `DATABASE_URL`:**
- Ve a **Settings → Database → Connection string → URI**
- Copia el string y reemplaza `[password]` por la contraseña del paso 1

### Paso 3 — Actualizar el .env

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:tucontraseña@db.xxxx.supabase.co:5432/postgres
```

### Paso 4 — Crear las tablas

Con el `.env` configurado:

```bash
cd backend
alembic upgrade head
```

---

## 8. Cómo hacer deploy en Render

### Paso 1 — Asegúrate de tener estos archivos commiteados

- `backend/requirements.txt`
- `backend/Procfile`

### Paso 2 — Crear el servicio

1. Ve a [render.com](https://render.com) → login con GitHub
2. **New → Web Service**
3. Conecta el repo `Vestido_Virtual`
4. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Paso 3 — Variables de entorno

En la sección **Environment** agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | el de Supabase |
| `SUPABASE_URL` | el de Supabase |
| `SUPABASE_KEY` | el de Supabase |
| `OPENWEATHER_API_KEY` | el del equipo |
| `JWT_SECRET_KEY` | una cadena larga aleatoria (genera una en generate-secret.vercel.app/32) |
| `DEBUG` | `False` |

### Paso 4 — Deploy

Clic en **Create Web Service**. Render construye el servidor y se actualiza automáticamente en cada push a `main`.

> Guarda la URL que te da Render (ej: `https://closy-backend.onrender.com`). La necesitas para Vercel y para el CORS.

---

## 9. Cómo hacer deploy en Vercel

### Paso 1 — Configurar la URL del backend

Crea el archivo `frontend/.env.production`:

```
VITE_API_URL=https://closy-backend.onrender.com
```

Commitea este archivo antes de hacer deploy.

### Paso 2 — Crear el proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) → login con GitHub
2. **Add New → Project**
3. Importa el repo `Vestido_Virtual`
4. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta solo)
5. En **Environment Variables** agrega:
   - `VITE_API_URL` = `https://closy-backend.onrender.com`
6. Clic en **Deploy**

### Paso 3 — Actualizar CORS

Con la URL de Vercel que te dé (ej: `https://closy.vercel.app`), Ana debe actualizar el CORS en `backend/app/api/routes/main.py`:

```python
allow_origins=["http://localhost:5173", "https://closy.vercel.app"],
```

---

## 10. Comandos útiles de referencia

### Backend

```bash
pip install -r requirements.txt          # instalar dependencias
uvicorn main:app --reload                 # correr servidor
# http://localhost:8000/docs             → documentación interactiva

alembic revision --autogenerate -m "descripcion"  # crear migración
alembic upgrade head                      # aplicar migraciones
alembic history                           # ver historial
```

### Frontend

```bash
npm install        # instalar dependencias
npm run dev        # correr en desarrollo
npm run build      # construir para producción
```

### Git

```bash
git branch                            # ver rama actual
git checkout -b nombre-rama           # crear y cambiar de rama
git status                            # ver qué cambió
git add . && git commit -m "mensaje"  # guardar cambios
git push origin nombre-rama           # subir rama
git pull origin main                  # traer últimos cambios de main
```

---

## 11. Glosario

**API** — Interfaz que permite que dos programas se comuniquen. El frontend le "pregunta" al backend por datos a través de la API.

**Endpoint** — Una URL específica de la API. Por ejemplo, `GET /prendas/` es el endpoint para listar prendas.

**Schema** — Define la forma de los datos que entran y salen de la API.

**Modelo** — Define cómo se guarda algo en la base de datos (las columnas de una tabla).

**Migración** — Un cambio controlado en la estructura de la base de datos. Se hace con Alembic.

**Variable de entorno** — Valor de configuración que no se guarda en el código (contraseñas, URLs). Se guardan en el archivo `.env`.

**JWT (Token)** — Código cifrado que identifica a un usuario. El frontend lo guarda y lo manda en cada petición para autenticarse.

**Hash** — Transformación de una contraseña a una versión irreversible y segura. Nunca se guarda la contraseña real.

**CORS** — Sin configurarlo, el navegador bloquea las peticiones del frontend al backend si están en dominios distintos.

**Deploy** — Subir el código a un servidor real accesible por internet.

**Render** — Servicio donde se despliega el backend (FastAPI).

**Vercel** — Servicio donde se despliega el frontend (React).

**Supabase** — Base de datos PostgreSQL en la nube con interfaz visual.

**Branch / Rama** — Copia paralela del código donde trabajas sin afectar `main`.

**Pull Request** — Solicitud para integrar los cambios de tu rama a `main`. Permite que las compañeras revisen antes de aceptar.
