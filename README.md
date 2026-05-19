# Vestidor Virtual

Aplicación web para gestionar un guardarropa digital, crear outfits y recibir sugerencias según el clima.

Stack: **React** (frontend) · **FastAPI + Python** (backend) · **SQLite** (base de datos)

---

## Estructura del proyecto

```
Proyecto_Inicial/
├── frontend/          → Interfaz de usuario (React)
├── backend/           → API REST (FastAPI)
├── database/          → Base de datos y migraciones (SQLite + Alembic)
└── app/               → Prototipos iniciales en Streamlit (referencia)
```

---

## ¿Dónde va cada cosa?

### Frontend — `frontend/`

| Carpeta | Qué va ahí | Ejemplo |
|---|---|---|
| `src/pages/` | Una carpeta por vista/pantalla | `Inicio.jsx`, `MiRopa.jsx`, `Outfits.jsx` |
| `src/components/` | Piezas reutilizables de UI | `TarjetaPrenda.jsx`, `Navbar.jsx` |
| `src/services/` | Funciones que llaman al backend | `prendas.js` con `getPrendas()`, `crearPrenda()` |
| `src/hooks/` | Lógica reutilizable de React | `usePrendas.js`, `useOutfits.js` |
| `src/assets/` | Imágenes, íconos, estilos globales | `logo.png`, `global.css` |
| `public/` | Archivos servidos tal cual | `index.html`, `favicon.ico` |

**Regla:** si es visual o de navegación → `pages/` o `components/`. Si habla con el backend → `services/`.

---

### Backend — `backend/`

| Carpeta | Qué va ahí | Ejemplo |
|---|---|---|
| `app/api/routes/` | Un archivo por recurso con sus endpoints | `prendas.py`, `outfits.py`, `clima.py` |
| `app/models/` | Definición de las tablas de la BD | `prenda.py` con la clase `Prenda` |
| `app/schemas/` | Validación de datos con Pydantic | `PrendaCreate`, `PrendaResponse` |
| `app/services/` | Lógica de negocio compleja | `sugerir_outfit()` según temperatura |
| `app/core/` | Configuración global | Conexión a la BD, variables de entorno, CORS |
| `tests/` | Pruebas automáticas con pytest | `test_prendas.py` |

**Regla:** los `routes/` solo reciben y responden. La lógica va en `services/`. Las tablas van en `models/`.

---

### Base de datos — `database/`

| Carpeta | Qué va ahí |
|---|---|
| `migrations/` | Scripts de Alembic para cambiar el esquema sin perder datos |
| `seeds/` | Datos de prueba para poblar la BD al iniciar el proyecto |

#### Esquema de tablas

**Prendas**
| Campo | Tipo | Descripción |
|---|---|---|
| id | PK | Identificador único |
| nombre | texto | Ej: "Polera blanca" |
| categoria | texto | Ej: "Polera", "Pantalón", "Zapatos" |
| color | texto | Ej: "blanco" |
| talla | texto | Ej: "S", "M", "L" |
| imagen | texto | URL o ruta de la imagen |

**Outfits**
| Campo | Tipo | Descripción |
|---|---|---|
| id | PK | Identificador único |
| categoria | texto | Ej: "Casual", "Formal" |
| id_prenda_1 | FK → Prendas | Primera prenda del outfit |
| id_prenda_2 | FK → Prendas | Segunda prenda del outfit |
| id_prenda_3 | FK → Prendas | Tercera prenda del outfit |

**Clima**
| Campo | Tipo | Descripción |
|---|---|---|
| id | PK | Identificador único |
| ciudad | texto | Ej: "Santiago" |
| temperatura | número | En grados Celsius |
| descripcion | texto | Ej: "Soleado", "Nublado" |
| fecha | fecha | Fecha de la consulta |

---

## ¿Cómo interactúan las partes?

```
Usuario
  │
  ▼
[React - frontend]          ← El usuario ve y hace click aquí
  │  HTTP (fetch/axios)
  ▼
[FastAPI - backend]         ← Recibe la petición, aplica lógica
  │  SQLAlchemy (ORM)
  ▼
[SQLite - database]         ← Guarda y entrega los datos
```

**Flujo ejemplo — el usuario agrega una prenda:**
1. Llena el formulario en `pages/MiRopa.jsx`
2. `services/prendas.js` hace un `POST /prendas` al backend
3. `routes/prendas.py` recibe los datos y los valida con `schemas/`
4. Llama al modelo en `models/prenda.py` para guardar en la BD
5. Devuelve la prenda creada → React actualiza la vista

---

## Prototipos Streamlit — `app/`

Los archivos en `app/` son experimentos previos al stack definitivo. No forman parte de la app final pero sirven como referencia visual y de lógica.

| Archivo | Para qué sirve |
|---|---|
| `app.py` | Prototipo de navegación y estructura general |
| `app2.py` | Referencia de mapas y gráficos interactivos |
| `app3.py` | Experimento de integración de mapas con el vestidor |
