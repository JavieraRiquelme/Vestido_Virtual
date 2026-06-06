import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from config import settings

app = FastAPI()

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def inicio():
    return {"mensaje": "Backend de Cata con Supabase funcionando"}

@app.post("/subir_prenda")
async def subir_prenda(
    user_id: str = Form(...),
    nombre: str = Form(...),
    categoria: str = Form(...),
    clima_adecuado: str = Form(...),
    file: UploadFile = File(...)
):
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    nueva_prenda = {
        "usuario_id": user_id,
        "nombre": nombre,
        "categoria": categoria,
        "clima_adecuado": clima_adecuado,
        "imagen_url": filepath 
    }
    
    response = settings.supabase.table("prendas").insert(nueva_prenda).execute()
    
    return {
        "status": "OK", 
        "data": response.data,
        "mensaje": "Prenda guardada exitosamente en Supabase"
