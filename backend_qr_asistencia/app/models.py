from sqlalchemy import Column, Integer, String, Boolean,  DateTime, Float, ForeignKey, UniqueConstraint, Table
from app.database import Base
from sqlalchemy.orm import relationship
import uuid 
from datetime import datetime 

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
    
    # --- CORREGIDO ---
    asignaturas_impartidas = relationship("Asignatura", back_populates="profesor") 
    asistencias_alumno = relationship("Asistencia", back_populates="alumno")
    asignaturas_inscritas = relationship(
        "Asignatura",
        secondary=inscripciones_alumnos,
        back_populates="alumnos_inscritos"
    )


class Asignatura(Base): 
    __tablename__ = "asignaturas"
    id = Column(Integer, primary_key=True, index=True) 
    nombre = Column(String(100), nullable=False)
    profesor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    codigo = Column(String(20), nullable=True, unique=True)

    # --- CORREGIDO ---
    profesor = relationship("Usuario", back_populates="asignaturas_impartidas") 
    alumnos_inscritos = relationship(
        "Usuario",
        secondary=inscripciones_alumnos,
        back_populates="asignaturas_inscritas"
    )
    sesiones_clase = relationship("SesionClase", back_populates="asignatura")


class SesionClase(Base):
    __tablename__ = "sesiones_clase"
    id = Column(Integer, primary_key=True, index=True)
    asignatura_id = Column(Integer, ForeignKey("asignaturas.id"), nullable=False)
    fecha = Column(DateTime, nullable=False, default=datetime.utcnow)
    hora_inicio = Column(String(10), nullable=True)
    hora_fin = Column(String(10), nullable=True)
    ubicacion = Column(String(100), nullable=True)

    # --- CORREGIDO ---
    asignatura = relationship("Asignatura", back_populates="sesiones_clase")
    asistencias = relationship("Asistencia", back_populates="sesion_clase")
    token_qr = relationship("TokenAsistencia", back_populates="sesion_clase", uselist=False)


class Asistencia(Base): 
    __tablename__ = "asistencia"
    id = Column(Integer, primary_key=True, index=True)
    sesion_clase_id = Column(Integer, ForeignKey("sesiones_clase.id"), nullable=False)
    alumno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    estado = Column(String(20), nullable=False)
    token_qr = Column(String(255), nullable=False)
    lat = Column(Float, nullable=True) 
    lng = Column(Float, nullable=True) 

    __table_args__ = (UniqueConstraint('sesion_clase_id', 'alumno_id', name='_sesion_alumno_uc'),)

    # --- CORREGIDO ---
    alumno = relationship("Usuario", back_populates="asistencias_alumno")
    sesion_clase = relationship("SesionClase", back_populates="asistencias")


def generate_uuid():
    return str(uuid.uuid4())

class TokenAsistencia(Base):
    __tablename__ = "token_asistencia"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(36), unique=True, index=True, default=generate_uuid)
    sesion_clase_id = Column(Integer, ForeignKey("sesiones_clase.id"), nullable=False, unique=True)
    fecha_expiracion = Column(DateTime, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)
    
    # --- CORREGIDO ---
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
    # --- CORREGIDO ---
    attendances = relationship("Attendance", back_populates="session")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    user_id = Column(Integer)  
    timestamp = Column(DateTime)
    lat = Column(Float)
    lng = Column(Float)
    # --- CORREGIDO ---
    session = relationship("Session", back_populates="attendances")