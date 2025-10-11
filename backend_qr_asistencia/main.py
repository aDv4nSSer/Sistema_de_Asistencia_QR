# main.py
from fastapi import FastAPI
from app.database import engine, Base
import app.models
from app.routers import users, auth, clases 
from app.qr import router as qr_router
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000", # Puerto por defecto de Create React App
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Permite peticiones desde el puerto 3000
    allow_credentials=True,       # Necesario para enviar cookies o headers de autenticación
    allow_methods=["*"],          # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],          # Permite todos los encabezados (incluyendo 'Authorization' para el token)
)


Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(qr_router)
app.include_router(clases.router) # <--- Incluir el nuevo router

@app.get("/")
async def root():
    return {"message": "Backend funcionando y tablas creadas"}