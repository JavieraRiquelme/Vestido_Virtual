# Guía: Configuración de database.py con Supabase

## Contexto del proyecto

El proyecto usa **Supabase** como proveedor de base de datos PostgreSQL y **SQLAlchemy** como ORM para interactuar con ella desde FastAPI. El archivo `database.py` es el puente entre ambos.

---

## Dependencias necesarias

Instalar con pip:

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

> `psycopg2-binary` es el driver que permite a SQLAlchemy hablar con PostgreSQL (que es lo que Supabase usa internamente).

---

## Cómo obtener la URL de conexión desde Supabase

1. Ir a [supabase.com](https://supabase.com) → entrar al proyecto
2. Menú izquierdo → **Settings** → **Database**
3. Bajar hasta la sección **Connection string**
4. Seleccionar el modo **URI**
5. Copiar la URL, que tiene este formato:

```
postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres
```

Esa URL va al archivo `.env`:

```env
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres
```

---

## Actualizar config.py

Agregar `DATABASE_URL` a la clase `Settings`:

```python
class Settings:
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Conexión directa PostgreSQL para SQLAlchemy
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # OpenWeatherMap
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    OPENWEATHER_URL: str = "https://api.openweathermap.org/data/2.5/weather"

    APP_NAME: str = os.getenv("APP_NAME", "Closy")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

settings = Settings()
```

---

## Código completo de database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Qué hace cada parte

| Parte | Descripción |
|---|---|
| `Base` | Clase madre de todos los modelos. Cada modelo hereda de ella |
| `engine` | La conexión real a la base de datos PostgreSQL de Supabase |
| `SessionLocal` | Fábrica de sesiones — crea la "conversación" con la BD |
| `get_db()` | Función que FastAPI llama automáticamente en cada request via `Depends(get_db)` |

---

## Cómo se conecta con el resto del proyecto

```
.env
 └── DATABASE_URL
      └── config.py (settings.DATABASE_URL)
           └── database.py (engine, SessionLocal, get_db, Base)
                ├── models/models.py  → importa Base para definir tablas
                └── routes/*.py       → importa get_db para acceder a la BD
```

### En models.py (lo que importa la compañera de modelos)

```python
from app.core.database import Base

class Prenda(Base):
    __tablename__ = "prenda"
    ...
```

### En routes (ya está hecho)

```python
from app.core.database import get_db

@router.get("/")
def listar(db: Session = Depends(get_db)):
    return db.query(Prenda).all()
```

---

## Crear las tablas en Supabase

Una vez que los modelos estén completos, ejecutar esto **una sola vez** para crear todas las tablas en Supabase:

```python
# Crear un archivo backend/create_tables.py
from app.core.database import Base, engine
from app.models.models import *  # importa todos los modelos

Base.metadata.create_all(bind=engine)
print("Tablas creadas exitosamente")
```

Ejecutar desde la carpeta `backend/`:

```bash
python create_tables.py
```

> Esto crea las tablas en Supabase según los modelos definidos en `models.py`. Solo se necesita correr cuando se agregan tablas nuevas o se corre el proyecto por primera vez.

---

## Verificar que funciona

Ir a Supabase → **Table Editor** y deberían aparecer todas las tablas:
`usuario`, `prenda`, `categoria_prenda`, `ocasion`, `outfit`, `outfit_prenda`, `clima`, `estilo_usuario`, `recomendacion`

---

## Resumen de archivos que debe tocar esta parte

| Archivo | Qué hacer |
|---|---|
| `.env` | Agregar `DATABASE_URL` con la URL de Supabase |
| `core/config.py` | Agregar `DATABASE_URL: str = os.getenv("DATABASE_URL", "")` |
| `core/database.py` | Reemplazar contenido con el código de esta guía |
| `create_tables.py` | Crear y ejecutar una vez para generar las tablas |
