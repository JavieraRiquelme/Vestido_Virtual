from fastapi import FastAPI, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
import os
import shutil
import models 

app = FastAPI()

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def inicio():
    return {"mensaje": "Backend de Cata con FastAPI funcionando"}

@app.post("/subir_prenda")
async def subir_prenda(
    user_id: int = Form(...),
    temp: float = Form(...),
    hum: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    nueva_prenda = models.Prenda(
        imagen_path=filepath,
        temperatura=temp,
        humedad=hum,
        user_id=user_id
    )
    db.add(nueva_prenda)
    db.commit()
    
    return {"status": "OK", "ruta": filepath}
