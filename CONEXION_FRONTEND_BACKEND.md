# Conectar Frontend y Backend 🐙

Esta guía explica los pasos necesarios para que la app funcione localmente: que el frontend pueda hablarle al backend y mostrar datos reales. Son 4 pasos y tienen un orden específico porque cada uno depende del anterior.

---

## Entendiendo cómo se conectan

El frontend (React, puerto 5173) y el backend (FastAPI, puerto 8000) son dos programas separados que se comunican por HTTP, igual que cuando un navegador carga una página web. El frontend le hace "preguntas" al backend (por ejemplo: "dame los outfits del usuario 1") y el backend le responde con los datos.

Para que esto funcione necesitamos tres cosas:
1. Que el backend permita las peticiones del frontend (CORS)
2. Que existan las tablas en la base de datos (si no hay tablas, el backend falla)
3. Que el frontend sepa la dirección del backend

---

## Orden de trabajo

```
① Ana  → Agregar CORS al backend
② Cata → Crear las tablas + cargar datos iniciales + crear usuario de prueba
③ Javiera → Apuntar el frontend al backend
④ Todas → Probar juntas
```

---

## ① Ana — Agregar CORS

**¿Por qué esto va primero?**

Sin CORS el navegador bloquea todas las peticiones del frontend al backend con un error. Es lo más bloqueante de todo, así que va primero.

**¿Qué es CORS exactamente?**

CORS (Cross-Origin Resource Sharing) es una medida de seguridad del navegador. Por defecto, si el frontend está en `localhost:5173` y el backend en `localhost:8000`, el navegador considera que son "orígenes distintos" y bloquea la comunicación. Configurar CORS es básicamente decirle al backend: "confío en las peticiones que vienen de estas direcciones".

**Qué tenés que hacer:**

Abrí el archivo `backend/app/api/routes/main.py` y agregá el middleware de CORS justo después de crear el `app`. El archivo ya tiene el resto del código, solo tenés que insertar el bloque del middleware:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # dirección del frontend local
    allow_credentials=True,
    allow_methods=["*"],   # permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # permite todos los headers
)
```

**Cómo verificar que funcionó:**

Reiniciá el servidor backend (`Ctrl+C` y volvé a correr `uvicorn main:app --reload`). Si no hay errores al arrancar, CORS está configurado. La verificación real la hacés después cuando el frontend pueda conectarse.

**Guardá y avisale a Cata que puede seguir.**

---

## ② Cata — Tablas, datos y usuario de prueba

**¿Por qué esto va segundo?**

Aunque CORS esté configurado, si el backend no tiene tablas en la base de datos va a fallar con errores tipo "la tabla no existe". Hay que crear las tablas antes de que el frontend empiece a hacer peticiones.

### Paso 1 — Crear las tablas automáticamente

Abrí `backend/main.py` y agregá el evento de startup. Este evento se ejecuta cada vez que el servidor arranca y crea las tablas si no existen:

```python
from app.api.routes.main import app
from app.models.models import Base
from app.core.database import engine

@app.on_event("startup")
def crear_tablas():
    # Crea todas las tablas definidas en models.py si todavía no existen
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

Reiniciá el servidor. Si arranca sin errores, las tablas se crearon.

---

### Paso 2 — Cargar las categorías y ocasiones

El servicio de sugerencias necesita que existan datos en las tablas `categorias_prenda` y `ocasiones`. Sin esto, cuando el frontend pida una sugerencia de outfit, el backend no va a encontrar categorías y va a devolver una lista vacía.

Creá el archivo `database/seeds/seed.py` con este contenido:

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

Ejecutalo desde la raíz del proyecto:
```bash
python database/seeds/seed.py
```

---

### Paso 3 — Crear un usuario de prueba

**¿Por qué hace falta?**

El frontend todavía tiene el usuario hardcodeado como `USUARIO_ID_TEMP = 1` en todas las pantallas. Esto significa que todas las peticiones van a pedir datos del usuario con `id = 1`. Si ese usuario no existe en la base de datos, el backend va a devolver listas vacías o errores.

**Cómo crearlo:**

1. Asegurate de que el backend esté corriendo: `uvicorn main:app --reload`
2. Abrí el navegador y andá a `http://localhost:8000/docs`
3. Esta es la documentación interactiva que genera FastAPI automáticamente. Podés probar todos los endpoints desde acá.
4. Buscá la sección **usuarios** y hacé clic en `POST /usuarios/`
5. Hacé clic en el botón **Try it out** (arriba a la derecha del endpoint)
6. En el campo **Request body**, reemplazá el contenido por:

```json
{
  "username": "usuarioprueba",
  "email": "prueba@closy.com",
  "nombre": "Usuario Prueba",
  "contraseña_hash": "1234"
}
```

7. Hacé clic en **Execute**
8. Verificá que en la respuesta aparezca `"id": 1`

Si aparece `"id": 1`, perfecto. Si aparece otro número significa que ya había usuarios en la base de datos. En ese caso borrá los usuarios existentes desde **Supabase → Table Editor → tabla usuarios** y volvé a intentar.

**Avisale a Javiera que puede seguir.**

---

## ③ Javiera — Apuntar el frontend al backend

**¿Por qué esto va tercero?**

El frontend necesita saber la dirección del backend para hacerle peticiones. Esta dirección se configura con una variable de entorno. Conviene hacer esto último para que cuando pruebes ya esté todo el backend listo.

**Cómo verificar que el archivo existe:**

Fijate si hay un archivo llamado `.env.local` dentro de la carpeta `frontend/`. Si no existe, crealo. En la terminal, desde la raíz del proyecto:

```bash
echo "VITE_API_URL=http://localhost:8000" > frontend/.env.local
```

Este archivo le dice al frontend: "el backend está en `http://localhost:8000`". El prefijo `VITE_` es obligatorio para que Vite lo reconozca como variable de entorno.

---

## ④ Todas — Probar juntas

Con los tres pasos anteriores completos, la app debería funcionar. Acá están las cosas para probar:

**1. Arrancar el backend** (en una terminal):
```bash
cd backend
uvicorn main:app --reload
```
Tiene que decir: `Application startup complete.`

**2. Arrancar el frontend** (en otra terminal):
```bash
cd frontend
npm run dev
```
Tiene que decir: `➜ Local: http://localhost:5173/`

**3. Abrir la app** en el navegador: `http://localhost:5173`

**4. Qué probar:**

- **Pantalla "Mis Outfits"** → tiene que cargar sin error (puede estar vacía, eso es normal)
- **Pantalla "Recomendaciones"** → seleccioná temperatura, condición y ocasión, hacé clic en "Armar outfit"
- **Pantalla "Resultado"** → si el usuario de prueba no tiene prendas cargadas, va a aparecer el mensaje "No tienes prendas cargadas para este clima", eso es correcto

---

## Si algo falla 🔍

| Lo que ves | Qué significa | Quién lo resuelve |
|------------|---------------|-------------------|
| Error "CORS" o "Access blocked" en la consola del navegador | CORS no está configurado | Ana — revisar tarea ① |
| Error "Failed to fetch" o "Network Error" | El backend no está corriendo | Verificar que `uvicorn` esté activo en la terminal |
| Error "relation does not exist" en la terminal del backend | Las tablas no se crearon | Cata — revisar paso 1 de tarea ② |
| La pantalla Mis Outfits carga pero está vacía | Normal, el usuario no tiene outfits guardados aún | No es un error |
| Recomendaciones devuelve "No tienes prendas" | El usuario de prueba no tiene prendas. Normal por ahora. | No es un error |
| La app abre pero los datos no cargan | Revisar que `VITE_API_URL` esté en `frontend/.env.local` | Javiera — revisar tarea ③ |
