from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    supabase: Client = create_client(url, key)
    return supabase