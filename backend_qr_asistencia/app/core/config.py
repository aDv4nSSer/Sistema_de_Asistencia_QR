# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Configuración de la Base de Datos
    # Lee las variables del archivo .env y las combina para formar la URL de conexión.
    DB_USER: str
    DB_PASSWORD: str
    DB_SERVER: str
    DB_PORT: str
    DB_NAME: str
    DATABASE_URL: str | None = None

    def __init__(self, **values):
        super().__init__(**values)
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@"
                f"{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}"
            )

    # Configuración de Seguridad JWT (JSON Web Tokens)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_SECRET_KEY: str
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"  # Indica a Pydantic que cargue las variables desde un archivo .env

# Creamos una instancia de la configuración que usaremos en toda la aplicación.
settings = Settings()