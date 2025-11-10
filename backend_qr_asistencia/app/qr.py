from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from io import BytesIO
import qrcode
import math 

from app import schemas, crud, models
from app.database import get_db
from app.auth_utils import get_current_user_with_roles

router = APIRouter(
    prefix="/qr",
    tags=["QR y Asistencia"]
)

# --- Constantes de Geolocalización ---
UBICACION_UNIVERSIDAD = {
    "lat": -33.4671903,
    "lng": -70.6598575
}
RADIO_PERMITIDO_METROS = 500 

def calcular_distancia(lat1, lon1, lat2, lon2):
    R = 6371000
    phi_1 = math.radians(lat1)
    phi_2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi_1) * math.cos(phi_2) * \
        math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distancia = R * c  
    return distancia

# --- Lógica de Tokens (MODIFICADA) ---

def verificar_token_uuid(db: Session, token_uuid: str) -> models.TokenAsistencia:
    """
    Verifica un token UUID de la base de datos.
    Si es válido, devuelve el objeto token (con la sesion y asignatura precargadas).
    Si no, lanza una excepción.
    """
    # Usamos la función CRUD que precarga las relaciones
    db_token = crud.get_token_asistencia_por_uuid(db, token=token_uuid)

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código QR no válido o ya fue utilizado."
        )

    if datetime.utcnow() > db_token.fecha_expiracion:
        crud.borrar_token_asistencia(db, db_token.id)
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Código QR ha expirado."
        )
    
    return db_token

# --- Rutas (Endpoints) (MODIFICADO) ---

@router.post("/generate/{sesion_id}", response_class=StreamingResponse)
def generate_qr_for_sesion(
    sesion_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_with_roles(["profesor"]))
):
    """
    Genera un token UUID de asistencia para una SESIÓN de clase específica.
    """
    db_sesion = crud.get_sesion_clase_por_id(db, sesion_id)
    if not db_sesion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión de clase no encontrada")
    
    # Verificación de seguridad
    db_asignatura = crud.get_asignatura_por_id(db, db_sesion.asignatura_id)
    if db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
    
    # 1. Creamos el token UUID en la base de datos
    db_token = crud.crear_token_asistencia(db, sesion_id=sesion_id, expira_en_minutos=2)
    
    # 2. Creamos el QR usando el string del UUID
    qr_img = qrcode.make(db_token.token)
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
    Registra la asistencia de un alumno validando token, ubicación e inscripción.
    """
    
    # 1. Verificar la ubicación
    distancia = calcular_distancia(
        UBICACION_UNIVERSIDAD["lat"],
        UBICACION_UNIVERSIDAD["lng"],
        token_data.lat,
        token_data.lng
    )
    if distancia > RADIO_PERMITIDO_METROS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Estás a {int(distancia)} metros del campus. Debes estar a menos de {RADIO_PERMITIDO_METROS}m para registrar tu asistencia."
        )

    # 2. Verificar el token QR (UUID)
    db_token = verificar_token_uuid(db, token_uuid=token_data.qr_token)
    
    # --- 3. VERIFICAR INSCRIPCIÓN (LÓGICA MODIFICADA) ---
    # El token nos da la sesión, la sesión nos da la asignatura.
    asignatura_id = db_token.sesion_clase.asignatura_id
    
    esta_inscrito = crud.verificar_inscripcion(db, alumno_id=current_user.id, asignatura_id=asignatura_id)
    
    if not esta_inscrito:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No estás inscrito(a) en esta asignatura. No puedes registrar asistencia."
        )
    
    # 4. Crear el objeto de asistencia
    asistencia_schema = schemas.AsistenciaCreate(
        sesion_clase_id=db_token.sesion_clase_id, # <-- MODIFICADO
        alumno_id=current_user.id, 
        timestamp=datetime.utcnow(),
        estado="presente", 
        token_qr=token_data.qr_token,
        lat=token_data.lat,
        lng=token_data.lng
    )
    
    # 5. Intentar guardar en la base de datos
    try:
        db_asistencia = crud.create_asistencia(db=db, asistencia=asistencia_schema)
        
        # 6. Borramos el token para que no se pueda reusar
        crud.borrar_token_asistencia(db, db_token.id)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya has registrado asistencia para esta sesión."
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error inesperado al registrar la asistencia."
        )

    return {"message": "Asistencia registrada correctamente", "asistencia_id": db_asistencia.id}