from sqlalchemy import Column, Integer, String, Boolean,  DateTime, Float, ForeignKey, UniqueConstraint, Table, Enum
from app.database import Base
from sqlalchemy.orm import relationship
import uuid 
from datetime import datetime 
import pytz
import enum # <-- Importado para el Enum

# --- LÓGICA DE ZONA HORARIA ---
TZ_CHILE = pytz.timezone('America/Santiago')
def get_local_time():
    """Devuelve la hora local actual de Chile."""
    return datetime.now(TZ_CHILE)
# --- FIN DE LA LÓGICA ---


# --- 1. TABLA DE ASOCIACIÓN ---
inscripciones_alumnos = Table(
    'inscripciones_alumnos',
    Base.metadata,
    Column('alumno_id', Integer, ForeignKey('usuarios.id'), primary_key=True),
    Column('asignatura_id', Integer, ForeignKey('asignaturas.id'), primary_key=True)
)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    contrasena_hash = Column(String(255), nullable=False)  
    rol = Column(String(20), nullable=False) 
    activo = Column(Boolean, default=True)
    
    asignaturas_impartidas = relationship("Asignatura", back_populates="profesor") 
    asistencias_alumno = relationship("Asistencia", back_populates="alumno")
    asignaturas_inscritas = relationship(
        "Asignatura",
        secondary=inscripciones_alumnos,
        back_populates="alumnos_inscritos"
    )

# --- AÑADIDO: Nuevo Modelo Horario ---
class DiaSemana(enum.Enum):
    lunes = "Lunes"
    martes = "Martes"
    miercoles = "Miércoles"
    jueves = "Jueves"
    viernes = "Viernes"
    sabado = "Sábado"
    domingo = "Domingo"

class Horario(Base):
    __tablename__ = "horarios"
    id = Column(Integer, primary_key=True, index=True)
    asignatura_id = Column(Integer, ForeignKey("asignaturas.id"), nullable=False)
    dia_semana = Column(Enum(DiaSemana), nullable=False)
    hora_inicio = Column(String(5), nullable=False) # Formato "HH:MM"
    hora_fin = Column(String(5), nullable=False)   # Formato "HH:MM"
    
    asignatura = relationship("Asignatura", back_populates="horarios")
# --- FIN DE LA MODIFICACIÓN ---


class Asignatura(Base): 
    __tablename__ = "asignaturas"
    id = Column(Integer, primary_key=True, index=True) 
    nombre = Column(String(100), nullable=False)
    profesor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    codigo = Column(String(20), nullable=True, unique=True)

    profesor = relationship("Usuario", back_populates="asignaturas_impartidas") 
    alumnos_inscritos = relationship(
        "Usuario",
        secondary=inscripciones_alumnos,
        back_populates="asignaturas_inscritas"
    )
    sesiones_clase = relationship("SesionClase", back_populates="asignatura")
    
    # ---  AÑADIDO: Relación con Horario ---
    horarios = relationship("Horario", back_populates="asignatura")
    # --- FIN DE LA MODIFICACIÓN ---


class SesionClase(Base):
    __tablename__ = "sesiones_clase"
    id = Column(Integer, primary_key=True, index=True)
    asignatura_id = Column(Integer, ForeignKey("asignaturas.id"), nullable=False)
    
    # --- MODIFICADO: Añadido timezone=True ---
    fecha = Column(DateTime(timezone=True), nullable=False, default=get_local_time)
    
    hora_inicio = Column(String(10), nullable=True)
    hora_fin = Column(String(10), nullable=True)
    ubicacion = Column(String(100), nullable=True)

    asignatura = relationship("Asignatura", back_populates="sesiones_clase")
    asistencias = relationship("Asistencia", back_populates="sesion_clase")
    token_qr = relationship("TokenAsistencia", back_populates="sesion_clase", uselist=False)


class Asistencia(Base): 
    __tablename__ = "asistencia"
    id = Column(Integer, primary_key=True, index=True)
    sesion_clase_id = Column(Integer, ForeignKey("sesiones_clase.id"), nullable=False)
    alumno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    # --- MODIFICADO: Añadido timezone=True ---
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    estado = Column(String(20), nullable=False)
    token_qr = Column(String(255), nullable=False)
    lat = Column(Float, nullable=True) 
    lng = Column(Float, nullable=True) 

    __table_args__ = (UniqueConstraint('sesion_clase_id', 'alumno_id', name='_sesion_alumno_uc'),)

    alumno = relationship("Usuario", back_populates="asistencias_alumno")
    sesion_clase = relationship("SesionClase", back_populates="asistencias")


def generate_uuid():
    return str(uuid.uuid4())

class TokenAsistencia(Base):
    __tablename__ = "token_asistencia"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(36), unique=True, index=True, default=generate_uuid)
    sesion_clase_id = Column(Integer, ForeignKey("sesiones_clase.id"), nullable=False, unique=True)
    
    # --- MODIFICADO: Añadido timezone=True ---
    fecha_expiracion = Column(DateTime(timezone=True), nullable=False)
    
    # --- MODIFICADO: Añadido timezone=True ---
    creado_en = Column(DateTime(timezone=True), default=get_local_time)
    
    sesion_clase = relationship("SesionClase", back_populates="token_qr")


# --- MODELOS ANTIGUOS (Session y Attendance) ---
class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    valid_from = Column(DateTime)
    valid_until = Column(DateTime)
    lat = Column(Float)
    lng = Column(Float)
    radius_meters = Column(Float, default=50)
    attendances = relationship("Attendance", back_populates="session")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    user_id = Column(Integer)  
    timestamp = Column(DateTime)
    lat = Column(Float)
    lng = Column(Float)
    session = relationship("Session", back_populates="attendances")
