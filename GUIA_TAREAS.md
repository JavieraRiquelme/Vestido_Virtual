# Tareas del Proyecto Closy 🐙

Esta guía explica qué hace cada archivo, por qué es importante y cómo completar cada tarea. Está pensada para que puedas trabajar aunque sea tu primera vez con FastAPI o cualquiera de estas herramientas.

---

## Cómo trabajar con Git (leer antes de empezar)

Git es la herramienta que usamos para que las tres puedan trabajar en el mismo código sin pisarse. La idea es simple: cada una trabaja en su propia "rama" (una copia del código), y cuando termina, la integra al código principal.

**Antes de empezar cualquier tarea:**
```bash
git checkout main          # volvés a la rama principal
git pull origin main       # bajás los últimos cambios de tus compañeras
git checkout -b tu-rama    # creás tu propia rama para trabajar
```

**Cuando terminás una tarea:**
```bash
git add .                              # marcás los archivos que cambiaste
git commit -m "descripción del cambio" # guardás los cambios con un mensaje
git push origin tu-rama               # subís tu rama a GitHub
```

Después vas a GitHub y creás un Pull Request para que tus compañeras revisen lo que hiciste antes de integrarlo.

---

## Ana — Core, Servicios y Supabase

**Tu rama:** `git checkout -b ana/auth-y-cors`

Tu área es la base técnica del backend: la configuración general, la conexión a la base de datos y la lógica de autenticación (que es lo que protege que cada usuaria solo vea sus propias cosas).

---

### Tarea 1 — Agregar CORS

**¿Qué es CORS y por qué importa?**

CORS es una medida de seguridad del navegador. Por defecto, cuando el frontend (corriendo en `localhost:5173`) intenta hablarle al backend (en `localhost:8000`), el navegador lo bloquea porque son "dominios diferentes". CORS le dice al navegador "está bien, confío en esas peticiones".

Sin CORS, el frontend no puede conectarse al backend y verás un error como "Access to fetch has been blocked" en la consola del navegador.

**¿Dónde hacer el cambio?**

Abre el archivo `backend/app/api/routes/main.py`. Este archivo es donde se crea la aplicación FastAPI y se registran todas las rutas. Tenés que agregar el middleware de CORS justo después de crear el `app`.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    usuarios, prendas, categorias, ocasiones,
    outfits, clima, estilos, recomendaciones, sugerencias,
)

app = FastAPI(title="Closy API")

# Esto le dice al navegador que confíe en las peticiones del frontend
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

> Cuando Javiera suba el frontend a Vercel y te pase la URL real, reemplazá `"https://tu-app.vercel.app"` por esa URL y volvé a hacer push.

---

### Tarea 2 — Agregar configuración de JWT

**¿Qué es JWT?**

JWT (JSON Web Token) es como un "carnet de identidad" digital. Cuando una usuaria hace login, el backend le entrega un token. Desde ese momento, cada vez que el frontend hace una petición, manda ese token para identificarse. Así el backend sabe quién está pidiendo los datos.

**¿Dónde hacer el cambio?**

Abre `backend/app/core/config.py`. Este archivo centraliza toda la configuración de la app. Actualmente tiene las variables de Supabase y OpenWeather. Tenés que agregar tres nuevas variables dentro de la clase `Settings`:

```python
# Estas tres líneas van dentro de la clase Settings, junto a las otras variables
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "clave-local-cambiar-en-produccion")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_MINUTES: int = 1440  # el token dura 24 horas
```

El `JWT_SECRET_KEY` es como la firma del backend. Todos los tokens se firman con esa clave, así el backend puede verificar que el token es legítimo. En producción (Render) tiene que ser una cadena larga y aleatoria, no la del ejemplo.

---

### Tarea 3 — Crear el servicio de autenticación

**¿Qué hace este archivo?**

Los "servicios" son archivos con lógica de negocio que las rutas llaman. Este servicio en particular va a tener tres funciones:
- `hashear_password`: convierte una contraseña en texto plano a una versión cifrada. Nunca guardamos contraseñas en texto plano.
- `verificar_password`: comprueba que la contraseña que escribe la usuaria coincide con el hash guardado.
- `crear_token`: genera el JWT que se le entrega a la usuaria cuando hace login.

**Creá el archivo** `backend/app/services/auth_service.py` con este contenido:

```python
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings

# CryptContext maneja el cifrado de contraseñas con el algoritmo bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashear_password(password: str) -> str:
    """Recibe la contraseña en texto plano y devuelve su versión cifrada."""
    return pwd_context.hash(password)

def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    """Compara la contraseña ingresada con el hash guardado en la base de datos."""
    return pwd_context.verify(password_plano, password_hasheado)

def crear_token(datos: dict) -> str:
    """Crea y firma un JWT con los datos del usuario (normalmente su id)."""
    datos_token = datos.copy()
    expiracion = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    datos_token.update({"exp": expiracion})
    return jwt.encode(datos_token, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verificar_token(token: str) -> dict:
    """Verifica que un JWT sea válido y devuelve los datos que contiene."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
```

**Instalá las librerías necesarias.** Abrí la terminal, andá a la carpeta `backend/` y corré:

```bash
pip install passlib[bcrypt] python-jose[cryptography]
```

Después abrí `backend/requirements.txt` y agregá al final:

```
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
```

Esto es importante para que cuando Render instale las dependencias también las incluya.

---

### Tarea 4 — Limpiar código muerto en clima.py

**¿Por qué hay que hacer esto?**

En `backend/app/services/clima.py` hay una función llamada `sugerir_outfit` que nunca se usa. La lógica real de sugerencias de outfit está en otro archivo (`sugerir_outfit.py`). Tener código muerto confunde a quien lee el proyecto.

Abrí `backend/app/services/clima.py` y borrá todo desde la función `sugerir_outfit` hasta el final del archivo (aproximadamente desde la línea 83). El archivo debe quedar solo con las funciones `_categorizar`, `obtener_clima`, `obtener_clima_gps`.

---

### Tarea 5 — Conectar Supabase

**¿Qué es Supabase?**

Supabase es una plataforma que nos da una base de datos PostgreSQL en la nube con una interfaz visual. En vez de instalar una base de datos en nuestra computadora, usamos la de Supabase para que todas puedan acceder a los mismos datos.

**Paso a paso:**

1. Entrá a [supabase.com](https://supabase.com) e iniciá sesión con GitHub o Google
2. Hacé clic en **New Project**
3. Ponle nombre: `closy`, elegí la región **South America (São Paulo)**, escribí una contraseña segura y **guardala en un lugar seguro** (la vas a necesitar después)
4. Esperá aproximadamente 2 minutos a que el proyecto se cree

**Obtener las credenciales:**
- Andá a **Settings** (ícono de engranaje, abajo a la izquierda) → **API**
- Copiá el **Project URL** → eso es tu `SUPABASE_URL`
- Copiá la clave **anon public** → eso es tu `SUPABASE_KEY`
- Ahora andá a **Settings** → **Database** → bajá hasta **Connection string** → hacé clic en la pestaña **URI** → copiá ese string → reemplazá `[password]` por la contraseña que guardaste

**Actualizar el archivo .env:**

Abrí el archivo `.env` en la raíz del proyecto y completá:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:tucontraseña@db.xxxx.supabase.co:5432/postgres
```

> **Importante:** el archivo `.env` nunca se sube a GitHub (está en el `.gitignore`). Pasale el `DATABASE_URL` a Cata y a Javiera por mensaje privado.

---

**Cuando termines todas las tareas:**
```bash
git add .
git commit -m "Agregar CORS, JWT config y auth service"
git push origin ana/auth-y-cors
```
Creá un Pull Request en GitHub y avisale a las compañeras.

---
---

## Javiera — Rutas, Schemas y Render

**Tu rama:** `git checkout -b javiera/auth-routes-render`

Tu área son los endpoints que usa el frontend y la configuración del servidor en producción. Las "rutas" son básicamente las URLs que el frontend llama (como `/auth/login` o `/prendas/`), y los "schemas" definen la forma exacta de los datos que entran y salen.

---

### Tarea 1 — Crear las rutas de autenticación

**¿Qué hace este archivo?**

Actualmente el backend no tiene ningún endpoint de login o registro. El frontend necesita dos:
- `POST /auth/register` → para crear una cuenta nueva
- `POST /auth/login` → para iniciar sesión y recibir el token

Estas rutas usan las funciones que Ana creó en `auth_service.py`.

**Creá el archivo** `backend/app/api/routes/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario
from app.services.auth_service import hashear_password, verificar_password, crear_token
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Define la forma de los datos que llegan al registro
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    nombre: str
    password: str

# Define la forma de los datos que llegan al login
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(datos: RegisterRequest, db: Session = Depends(get_db)):
    # Verificar que el username y email no estén en uso
    if db.query(Usuario).filter(
        (Usuario.username == datos.username) | (Usuario.email == datos.email)
    ).first():
        raise HTTPException(status_code=400, detail="Username o email ya en uso")
    # Crear el usuario con la contraseña hasheada (nunca guardamos contraseñas en texto plano)
    usuario = Usuario(
        username=datos.username,
        email=datos.email,
        nombre=datos.nombre,
        contraseña_hash=hashear_password(datos.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    # Devolver el token para que el frontend quede logueado automáticamente
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}

@router.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    # Buscar la usuaria por username
    usuario = db.query(Usuario).filter(Usuario.username == datos.username).first()
    # Si no existe o la contraseña no coincide, devolver error genérico (por seguridad)
    if not usuario or not verificar_password(datos.password, usuario.contraseña_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = crear_token({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id}
```

**Registrá el router** en `backend/app/api/routes/main.py`. Agregá estas dos líneas en los lugares correspondientes:

```python
# En los imports, junto a los otros:
from app.api.routes import auth

# En los include_router, junto a los otros:
app.include_router(auth.router, prefix="/auth", tags=["auth"])
```

---

### Tarea 2 — Corregir un bug en el schema de clima

**¿Qué es un schema?**

Los schemas definen la forma exacta de los datos que entran y salen de la API. Por ejemplo, el schema de `ClimaRead` le dice a FastAPI exactamente qué campos tiene una respuesta de clima y de qué tipo es cada uno.

**El bug:** en `backend/app/schemas/clima.py` la temperatura está declarada como `int` (número entero), pero en la base de datos se guarda como `float` (número con decimales, como 18.5°C). Esto hace que Pydantic falle cuando intenta devolver temperaturas con decimales.

Abrí `backend/app/schemas/clima.py` y cambiá esta línea:

```python
# Antes (incorrecto — las temperaturas tienen decimales):
temperatura: int | None

# Después (correcto):
temperatura: float | None
```

---

### Tarea 3 — Agregar response_model a los endpoints

**¿Para qué sirve el response_model?**

El `response_model` le dice a FastAPI dos cosas: primero, qué forma tiene la respuesta (así la documenta automáticamente en `/docs`), y segundo, que valide y filtre la respuesta antes de enviarla. Sin esto, los endpoints pueden devolver más datos de los necesarios (como la contraseña hasheada).

Tenés que agregar `response_model` en cada archivo de rutas. Acá el ejemplo para `prendas.py`, pero repetí la misma lógica en `usuarios.py`, `categorias.py`, `ocasiones.py`, `outfits.py`, `estilos.py` y `recomendaciones.py`:

```python
# Primero agregá el import del schema Read (si no está ya):
from app.schemas.prenda import PrendaCreate, PrendaRead

# Después agregá response_model a cada endpoint:
@router.get("/", response_model=list[PrendaRead])        # lista de prendas
@router.get("/{prenda_id}", response_model=PrendaRead)   # una prenda por id
@router.post("/", response_model=PrendaRead)             # crear prenda
@router.put("/{prenda_id}", response_model=PrendaRead)   # actualizar prenda
# El DELETE no necesita response_model, ya devuelve un mensaje simple
```

---

### Tarea 4 — Crear el Procfile para Render

**¿Qué es el Procfile?**

Es un archivo que le dice a Render exactamente cómo arrancar el servidor. Sin este archivo Render no sabe qué comando ejecutar.

Creá el archivo `backend/Procfile` (sin extensión, exactamente así, con P mayúscula) con exactamente este contenido:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

La variable `$PORT` la asigna Render automáticamente, no la tenés que cambiar.

---

### Tarea 5 — Deploy en Render

**¿Qué es Render?**

Render es el servicio donde vive el backend en producción. Cada vez que hacen push a `main` en GitHub, Render actualiza el servidor automáticamente.

**Paso a paso:**

1. Entrá a [render.com](https://render.com) e iniciá sesión con tu cuenta de GitHub
2. Hacé clic en **New +** → **Web Service**
3. Conectá el repositorio `Vestido_Virtual`
4. Configurá lo siguiente:
   - **Name:** `closy-backend`
   - **Root Directory:** `backend` (importante, el backend no está en la raíz)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Bajá hasta **Environment Variables** y agregá una por una:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | el que te pase Ana |
| `SUPABASE_URL` | el que te pase Ana |
| `SUPABASE_KEY` | el que te pase Ana |
| `OPENWEATHER_API_KEY` | la clave del equipo |
| `JWT_SECRET_KEY` | generá una en [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) |
| `DEBUG` | `False` |

6. Hacé clic en **Create Web Service**
7. Render va a tardar unos minutos en construir el servidor por primera vez
8. Cuando diga **Live**, copiá la URL que aparece (algo como `https://closy-backend.onrender.com`) y pasásela a las compañeras

---

**Cuando termines todas las tareas:**
```bash
git add .
git commit -m "Rutas de auth, fix schema clima, response_model y Procfile"
git push origin javiera/auth-routes-render
```
Creá un Pull Request en GitHub y avisale a las compañeras.

---
---

## Cata — Modelos y Base de Datos

**Tu rama:** `git checkout -b cata/modelos-y-db`

Tu área es que las tablas existan en la base de datos y que estén correctamente estructuradas. Los "modelos" son clases Python que representan las tablas de la base de datos. Alembic es la herramienta que traduce esos modelos a SQL y los crea en Supabase.

> **Importante:** esperá a que Ana configure Supabase y te pase el `DATABASE_URL` antes de correr las migraciones. Sin eso no podés conectarte a la base de datos.

---

### Tarea 1 — Crear las tablas automáticamente al arrancar

**¿Por qué hace falta esto?**

Actualmente cuando el backend arranca, intenta hacer consultas a la base de datos pero las tablas no existen, así que todo falla. Este cambio hace que el servidor cree las tablas automáticamente la primera vez que arranca.

Abrí `backend/main.py` y dejalo así:

```python
from app.api.routes.main import app
from app.models.models import Base
from app.core.database import engine

# Este evento se ejecuta automáticamente cuando el servidor arranca
@app.on_event("startup")
def crear_tablas():
    # create_all revisa qué tablas faltan y las crea. Si ya existen, no hace nada.
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

Después de este cambio, cada vez que arranques el servidor con `uvicorn main:app --reload`, las tablas se van a crear solas en la base de datos.

---

### Tarea 2 — Configurar Alembic (migraciones)

**¿Qué son las migraciones y para qué sirven?**

Imaginate que a mitad del proyecto necesitás agregarle un campo nuevo a la tabla de usuarios (por ejemplo, el número de teléfono). No podés simplemente borrar y recrear la base de datos porque ya tiene datos. Las migraciones son cambios controlados y reversibles en la estructura de la base de datos.

Alembic detecta automáticamente los cambios en los modelos Python y genera el SQL necesario para actualizar la base de datos.

**Instalá Alembic:**
```bash
pip install alembic
echo "alembic>=1.13.0" >> requirements.txt
```

**Inicializá Alembic dentro de la carpeta backend:**
```bash
cd backend
alembic init alembic
```

Esto crea una carpeta `backend/alembic/` con archivos de configuración.

**Configurá Alembic para que conozca tus modelos:**

Abrí el archivo `backend/alembic/env.py`. Buscá la línea que dice `target_metadata = None` y reemplazá ese bloque por esto:

```python
# Estas líneas le dicen a Alembic dónde están los modelos y la URL de la base de datos
from app.models.models import Base
from app.core.config import settings

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

**Creá y aplicá la primera migración** (necesitás tener el `.env` con el `DATABASE_URL` de Ana):

```bash
# Dentro de backend/
# Este comando lee los modelos y genera el SQL para crear las tablas:
alembic revision --autogenerate -m "Crear tablas iniciales"

# Este comando aplica la migración a la base de datos real:
alembic upgrade head
```

Después de esto, si entrás a Supabase → **Table Editor**, vas a ver todas las tablas creadas.

---

### Tarea 3 — Cargar datos iniciales (seeds)

**¿Por qué hace falta esto?**

La app necesita que existan datos en la tabla `categorias_prenda` (los 6 tipos de ropa) y en `ocasiones` (Universidad, Trabajo, Casual) para poder funcionar. El servicio de sugerencias los usa para armar los outfits. Sin estos datos, el endpoint de sugerencias devuelve resultados vacíos.

Creá el archivo `database/seeds/seed.py`:

```python
"""
Script para cargar los datos iniciales necesarios para que la app funcione.
Ejecutar UNA SOLA VEZ después de crear las tablas.
Comando: python database/seeds/seed.py  (desde la raíz del proyecto)
"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from app.core.database import SessionLocal
from app.models.models import CategoriaPrenda, Ocasion

db = SessionLocal()

# Los 6 tipos de prendas que usa el servicio de sugerencias
categorias = [
    CategoriaPrenda(id=1, nombre="Parte de arriba (manga larga)", rol="top_largo"),
    CategoriaPrenda(id=2, nombre="Parte de arriba (manga corta)", rol="top_corto"),
    CategoriaPrenda(id=3, nombre="Parte de abajo (largo)",        rol="bottom_largo"),
    CategoriaPrenda(id=4, nombre="Parte de abajo (corto)",        rol="bottom_corto"),
    CategoriaPrenda(id=5, nombre="Zapatos",                       rol="zapatos"),
    CategoriaPrenda(id=6, nombre="Accesorios",                    rol="accesorios"),
]

# Las 3 ocasiones disponibles en la pantalla de Recomendaciones
ocasiones = [
    Ocasion(id=1, nombre="Universidad", descripcion="Clases y campus"),
    Ocasion(id=2, nombre="Trabajo",     descripcion="Oficina y reuniones"),
    Ocasion(id=3, nombre="Casual",      descripcion="Salidas y tiempo libre"),
]

# El "if not" evita duplicados si corrés el script más de una vez
for cat in categorias:
    if not db.query(CategoriaPrenda).filter_by(id=cat.id).first():
        db.add(cat)

for oc in ocasiones:
    if not db.query(Ocasion).filter_by(id=oc.id).first():
        db.add(oc)

db.commit()
db.close()
print("✓ Seeds cargados correctamente.")
```

Ejecutalo desde la raíz del proyecto:
```bash
python database/seeds/seed.py
```

Si todo sale bien, verás: `✓ Seeds cargados correctamente.`
Podés verificarlo en Supabase → Table Editor → tabla `categorias_prenda`.

---

**Cuando termines todas las tareas:**
```bash
git add .
git commit -m "Startup de tablas, Alembic y seed script"
git push origin cata/modelos-y-db
```
Creá un Pull Request en GitHub y avisale a las compañeras.
