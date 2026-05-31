from fastapi import APIRouter
from app.services.clima import sugerir_outfit, obtener_clima

router = APIRouter()

@router.get('/clima')
def get_clima(ciudad: str = 'Santiago'):
    datos = obtener_clima(ciudad)
    return datos

@router.get('/outfit')
def get_outfit(ciudad: str = 'Santiago', ocasion: str = 'casual'):
    datos = sugerir_outfit(ciudad, ocasion)
    return datos