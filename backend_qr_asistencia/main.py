import os
# 👇 CORRECCIÓN: Importamos 'find_dotenv' para buscar el archivo .env activamente
from dotenv import load_dotenv, find_dotenv

# ======================= DIAGNÓSTICO =======================
# Ahora buscamos el archivo .env subiendo desde la ubicación de este script.
# Esta es la forma más robusta de encontrarlo.
env_path = find_dotenv()
load_dotenv(dotenv_path=env_path) 

print(f"DEBUG: Buscando archivo .env en: {env_path}")
print(f"DEBUG: El usuario de la DB es: {os.getenv('DB_USER')}")
# ==========================================================


# --- Tu código original con CORS ---
from fastapi import FastAPI
from app.database import engine, Base
import app.models
from app.routers import users, auth, clases 
from app.qr import router as qr_router
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

# Tu configuración de CORS (¡está perfecta!)
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(qr_router)
app.include_router(clases.router)

@app.get("/")
async def root():
    return {"message": "Backend funcionando y tablas creadas"}

