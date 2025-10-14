from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from io import BytesIO
import qrcode
from jose import JWTError, jwt

# Importaciones de la aplicación
from app import schemas, crud
from app.database import get_db
from app.auth_utils import get_current_user_with_roles
from app.core.config import settings # Importamos la configuración segura

router = APIRouter(
    prefix="/qr",
    tags=["QR y Asistencia"]
)

# --- Lógica de Tokens de Asistencia ---

def create_attendance_token(clase_id: int):
    """Genera un JWT de corta duración para una clase específica."""
    expire = datetime.utcnow() + timedelta(minutes=2)  # Expiración muy corta
    to_encode = {
        "exp": expire,
        "sub": str(clase_id),  # Guardamos el ID de la clase
        "type": "attendance" # Un tipo para diferenciarlo del token de sesión
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_attendance_token(token: str) -> int:
    """Verifica un token de asistencia y devuelve el ID de la clase."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Verificamos que sea un token de tipo 'attendance'
        if payload.get("type") != "attendance":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de token inválido")
            
        clase_id = int(payload.get("sub"))
        return clase_id
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token QR inválido o expirado"
        )

# --- Rutas (Endpoints) ---

@router.post("/generate/{clase_id}", response_class=StreamingResponse)
def generate_qr_for_class(
    clase_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_with_roles(["profesor"]))
):
    """
    Genera un token de asistencia seguro para una clase y lo devuelve como una imagen QR.
    Este endpoint es para ser llamado por el profesor.
    """
    # Opcional: añadir lógica para verificar que la clase existe y pertenece al profesor.
    # db_clase = crud.get_clase(db, clase_id) ...

    attendance_token = create_attendance_token(clase_id=clase_id)
    
    qr_img = qrcode.make(attendance_token)
    buffer = BytesIO()
    qr_img.save(buffer, "PNG")
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="image/png")


@router.post("/register-attendance", status_code=status.HTTP_201_CREATED)
def register_attendance_with_token(
    token_data: schemas.AsistenciaToken,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_with_roles(["estudiante"]))
):
    """
    Registra la asistencia de un alumno validando un token QR.
    Este endpoint es para ser llamado por el estudiante al escanear el QR.
    """
    # 1. Verificar el token QR para obtener el ID de la clase
    clase_id = verify_attendance_token(token=token_data.qr_token)
    
    # 2. Crear el objeto de asistencia para guardarlo en la DB
    asistencia_schema = schemas.AsistenciaCreate(
        clase_id=clase_id,
        alumno_id=current_user.id, # El ID del alumno viene del token de sesión
        timestamp=datetime.utcnow(),
        estado="presente", # Puedes definir un estado por defecto
        token_qr=token_data.qr_token # Guardamos el token para auditoría
    )
    
    # 3. Intentar guardar en la base de datos, manejando duplicados
    try:
        db_asistencia = crud.create_asistencia(db=db, asistencia=asistencia_schema)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya has registrado asistencia para esta clase."
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error inesperado al registrar la asistencia."
        )

    return {"message": "Asistencia registrada correctamente", "asistencia_id": db_asistencia.id}
