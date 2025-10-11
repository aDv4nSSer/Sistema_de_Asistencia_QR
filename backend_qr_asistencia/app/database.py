from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:54rtGh32@localhost:5432/QR_asistanse_Generator"

# Crear motor de conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear sesión local para las operaciones con la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos ORM
Base = declarative_base()

# Función para obtener sesión (se usará en rutas)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()