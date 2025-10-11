from sqlalchemy.orm import Session
from app import models, schemas
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from app.schemas import ClaseCreate # Asumiendo que se importa

# Usamos argon2 (más moderno y sin límite de 72 caracteres)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_por_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate):
    hashed_password = get_password_hash(usuario.contrasena)
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        rol=usuario.rol,
        activo=usuario.activo,
        contrasena_hash=hashed_password  # 👈 evita ñ en el campo
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def create_session(db: Session, session: schemas.SessionCreate):
    db_session = models.Session(
        session_id=session.session_id,
        valid_from=session.valid_from,
        valid_until=session.valid_until,
        lat=session.lat,
        lng=session.lng,
        radius_meters=session.radius_meters
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def create_attendance(db: Session, attendance: schemas.AttendanceCreate, user_id: int):
    db_session = db.query(models.Session).filter(models.Session.session_id == attendance.session_id).first()
    if not db_session:
        raise Exception("Session no encontrada")

    db_attendance = models.Attendance(
        session_id=db_session.id,
        user_id=user_id,
        timestamp=attendance.timestamp,
        lat=attendance.lat,
        lng=attendance.lng
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def create_asistencia(db: Session, asistencia: schemas.AsistenciaCreate):
    db_asistencia = models.Asistencia(
        clase_id = asistencia.clase_id,
        alumno_id = asistencia.alumno_id,
        timestamp = asistencia.timestamp,
        estado = asistencia.estado,
        token_qr = asistencia.token_qr
    )
    db.add(db_asistencia)
    db.commit()
    db.refresh(db_asistencia)
    return db_asistencia


def crear_clase(db: Session, clase: schemas.ClaseCreate):
    # Convertir el objeto date (de Pydantic) a un objeto datetime (para la DB)
    # Combinamos la fecha con una hora por defecto (ej: medianoche 00:00:00)
    fecha_dt = datetime.combine(clase.fecha, datetime.min.time()) 
    
    db_clase = models.Clase(
        nombre=clase.nombre,
        profesor_id=clase.profesor_id,
        fecha=fecha_dt, # 👈 Usamos el objeto datetime
        hora_inicio=clase.hora_inicio,
        hora_fin=clase.hora_fin,
        ubicacion=clase.ubicacion
    )
    db.add(db_clase)
    db.commit()
    db.refresh(db_clase)
    return db_clase

def crear_qr_code(db: Session, qr_code: schemas.QrCodeCreate):
    db_qr = models.QrCode(
        clase_id=qr_code.clase_id,
        qr_hash=qr_code.qr_hash,
        fecha_creacion=qr_code.fecha_creacion,
        fecha_expiracion=qr_code.fecha_expiracion,
        ubicacion_permitida=qr_code.ubicacion_permitida
    )
    db.add(db_qr)
    db.commit()
    db.refresh(db_qr)
    return db_qr

def get_qr_code_by_hash(db: Session, qr_hash: str):
    """Busca un registro de QR activo por su hash."""
    # Nota: Si quisieras forzar que solo busque QR activos, podrías añadir un filtro aquí, 
    # pero por ahora, solo buscamos por hash.
    return db.query(models.QrCode).filter(models.QrCode.qr_hash == qr_hash).first()