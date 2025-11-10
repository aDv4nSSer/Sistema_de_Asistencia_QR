import os
from dotenv import load_dotenv, find_dotenv

env_path = find_dotenv()
load_dotenv(dotenv_path=env_path) 

print(f"DEBUG: Buscando archivo .env en: {env_path}")
print(f"DEBUG: El usuario de la DB es: {os.getenv('DB_USER')}")

from fastapi import FastAPI
from app.database import engine, Base
import app.models
# --- 👇 MODIFICADO ---
from app.routers import users, auth, asistencia, gestion
from app.routers import asignaturas # <-- RENOMBRADO
# --- 👆 FIN ---
from app.qr import router as qr_router
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

origins = ["*"]

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
app.include_router(asistencia.router)
app.include_router(gestion.router)
app.include_router(asignaturas.router) # <-- MODIFICADO

@app.get("/")
async def root():
    return {"message": "Backend funcionando y tablas creadas"}