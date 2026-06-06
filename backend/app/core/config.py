from dotenv import load_dotenv
import os
load_dotenv()

class Settings:
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # OpenWeatherMap
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    OPENWEATHER_URL: str = "https://api.openweathermap.org/data/2.5/weather"
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4o"
    
    # Base de datos
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./datos.db")
    
    # Configuración general
    APP_NAME: str = os.getenv("APP_NAME", "Closy")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "clave-local-cambiar-en-produccion")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

settings = Settings()
