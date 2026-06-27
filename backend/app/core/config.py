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
    
    # Base de datos — corrige postgres:// → postgresql:// (Supabase entrega postgres://)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./datos.db").replace(
        "postgres://", "postgresql://", 1
    )
    
    # Configuración general
    APP_NAME: str = os.getenv("APP_NAME", "Closy")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "clave-local-cambiar-en-produccion")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # CORS — lista separada por comas en la env var ALLOWED_ORIGINS
    ALLOWED_ORIGINS: list = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if o.strip()
    ]

settings = Settings()
