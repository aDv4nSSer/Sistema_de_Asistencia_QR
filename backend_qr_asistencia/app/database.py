# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Importamos nuestra configuración centralizada
from app.core.config import settings

# 👈 MODIFICACIÓN: La URL ahora viene del objeto settings
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

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