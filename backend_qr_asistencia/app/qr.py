from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # 👈 IMPORTAR IntegrityError
from datetime import datetime, timedelta
from io import BytesIO
import qrcode
import json
from app.auth_utils import get_current_user_with_roles

# Mantenemos las clases específicas que usamos en el código:
from app.schemas import QrCodeCreate, AsistenciaCreate, AsistenciaRequest 

# 👈 AÑADE ESTA LÍNEA CRÍTICA para que Python reconozca 'schemas.QrCode'
from app import schemas 

from app.database import get_db
from app import crud 
from app.models import QrCode, Asistencia

router = APIRouter(
    prefix="/qr", # Agregamos un prefijo para mejor organización de rutas
    tags=["QR y Asistencia"]
)

# --- Rutas para Códigos QR ---

@router.post("/qrcodes", response_model=schemas.QrCode) # 👈 ¡USAR schemas.QrCode!
def create_qr(
    qr: QrCodeCreate,
    current_user=Depends(get_current_user_with_roles(["profesor"])),
    db: Session = Depends(get_db)
):
    """Crea un registro de QR en la base de datos (metadatos)."""
    db_qr = QrCode(
        clase_id=qr.clase_id,
        qr_hash=qr.qr_hash,
        fecha_creacion=qr.fecha_creacion,
        fecha_expiracion=qr.fecha_expiracion,
        ubicacion_permitida=qr.ubicacion_permitida
    )
    db.add(db_qr)
    db.commit()
    db.refresh(db_qr)
    return db_qr

@router.post("/generate_qr_img/")
def generate_qr_img(
    qr_data: QrCodeCreate,
    current_user=Depends(get_current_user_with_roles(["profesor"]))
):
    """Genera y retorna la imagen PNG del código QR basado en los datos proporcionados."""
    # Convertir el esquema Pydantic a un diccionario serializable para el QR
    qr_json = qr_data.model_dump_json() 
    
    qr_img = qrcode.make(qr_json)
    buffer = BytesIO() 
    
    qr_img = qrcode.make(qr_json)
    buffer = BytesIO()
    qr_img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="image/png")

# --- Rutas para Registro de Asistencia ---

@router.post("/register_attendance/")
def register_attendance(
    data: schemas.AsistenciaRequest,
    current_user=Depends(get_current_user_with_roles(["estudiante"])),
    db: Session = Depends(get_db)
):
    """Registra la asistencia de un alumno validando el QR y la marca de tiempo."""
    
    # 1. Validación de QR (Existencia y Expiración)
    qr_record = crud.get_qr_code_by_hash(db, qr_hash=data.token_qr)
    
    if not qr_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Código QR inválido o no encontrado."
        )

    # Convertimos la marca de tiempo del cliente a objeto datetime para la comparación
    try:
        data_timestamp_dt = datetime.fromisoformat(data.timestamp.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Formato de timestamp inválido."
        )

    now = datetime.utcnow()
    
    # Comprobar expiración
    if now > qr_record.fecha_expiracion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El código QR ha expirado. Debe escanear un código nuevo."
        )
    
    # 2. Validación de Tiempo (Ventana de 5 minutos)
    # Comparamos el 'timestamp' del cliente (ya convertido) contra la hora del servidor (now)
    if not (now - timedelta(minutes=5) <= data_timestamp_dt <= now + timedelta(minutes=5)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tiempo de registro fuera del rango permitido (5 minutos de tolerancia)."
        )
    
    # 3. Creación del esquema AsistenciaCreate para el CRUD
    asistencia_schema = schemas.AsistenciaCreate(
        clase_id=qr_record.clase_id, 
        alumno_id=current_user.id,
        timestamp=data_timestamp_dt, # 👈 Usamos el datetime convertido
        estado=data.estado,
        token_qr=data.token_qr
    )
    
    # 4. Llamada a la función CRUD y manejo de errores (Duplicados)
    try:
        db_asistencia = crud.create_asistencia(db=db, asistencia=asistencia_schema)
    except IntegrityError:
        # Esto atrapa errores como la violación de restricción de unicidad (ej: estudiante ya registrado)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Ya has registrado asistencia para esta clase."
        )
    except Exception as e:
        db.rollback()
        print(f"Error desconocido al crear asistencia: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error inesperado al registrar asistencia."
        )

    return {"message": "Asistencia registrada correctamente", "id": db_asistencia.id}
