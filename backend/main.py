from app.api.routes.main import app
from app.models.models import Base
from app.core.database import engine


@app.on_event("startup")
def crear_tablas():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[WARN] DB no disponible al iniciar: {e}")
        print("[INFO] El servidor levanto igual. Endpoints sin DB funcionan.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
