import os
from dotenv import load_dotenv, find_dotenv

env_path = find_dotenv()
load_dotenv(dotenv_path=env_path) 

print(f"DEBUG: Buscando archivo .env en: {env_path}")
print(f"DEBUG: El usuario de la DB es: {os.getenv('DB_USER')}")

from fastapi import FastAPI, Request, status # <-- MODIFICADO
from fastapi.responses import JSONResponse # <-- AÑADIDO
from app.database import engine, Base
import app.models
from app.routers import users, auth, asistencia, gestion
from app.routers import asignaturas
from app.qr import router as qr_router
from fastapi.middleware.cors import CORSMiddleware 

# --- 👇 AÑADIDO (1/3): IMPORTS PARA RATE LIMIT ---
from app.limiter import limiter 
from slowapi.errors import RateLimitExceeded
# --- 👆 FIN DE LA MODIFICACIÓN ---

app = FastAPI()

# --- 👇 AÑADIDO (2/3): INICIALIZAR LIMITER Y MANEJAR EXCEPCIÓN ---
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Manejador personalizado para cuando se supera el límite de peticiones.
    Devuelve un error 429 (Too Many Requests).
    """
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": f"Demasiadas peticiones. Límite: {exc.detail}"},
    )
# --- 👆 FIN DE LA MODIFICACIÓN ---

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
app.include_router(asignaturas.router) 

@app.get("/")
async def root():
    return {"message": "Backend funcionando y tablas creadas"}