from sqlalchemy import Column, Integer, String, Boolean,  DateTime, Float, ForeignKey, UniqueConstraint
from app.database import Base
from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    contrasena_hash = Column(String(255), nullable=False)  # 👈 cambiado, sin ñ
    rol = Column(String(20), nullable=False)  # 'alumno' o 'profesor'
    activo = Column(Boolean, default=True)
    clases_impartidas = relationship("Clase", back_populates="profesor") 

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
    user_id = Column(Integer)  # o ForeignKey a tabla users si la tienes
    timestamp = Column(DateTime)
    lat = Column(Float)
    lng = Column(Float)
    
    session = relationship("Session", back_populates="attendances")

class Clase(Base): # <--- Clase corregida
    __tablename__ = "clases"
    id = Column(Integer, primary_key=True, index=True) 
    nombre = Column(String(100), nullable=False)
    profesor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(DateTime, nullable=False)
    hora_inicio = Column(String(10), nullable=False)
    hora_fin = Column(String(10), nullable=False)
    ubicacion = Column(String(100), nullable=True)

    # NUEVA RELACIÓN: Una clase tiene un solo profesor
    profesor = relationship("Usuario", back_populates="clases_impartidas") 


class QrCode(Base): # <--- Clase corregida
    __tablename__ = "qrcodes"
    id = Column(Integer, primary_key=True, index=True)
    clase_id = Column(Integer, ForeignKey("clases.id"), nullable=False)
    qr_hash = Column(String(255), nullable=False, unique=True)
    fecha_creacion = Column(DateTime, nullable=False)
    fecha_expiracion = Column(DateTime, nullable=False)
    ubicacion_permitida = Column(String(255), nullable=True)
    # clase = relationship("Clase", back_populates="qrcodes") # Si se define en Clase


class Asistencia(Base): # <--- Clase corregida
    __tablename__ = "asistencia"
    id = Column(Integer, primary_key=True, index=True)
    clase_id = Column(Integer, ForeignKey("clases.id"), nullable=False)
    alumno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    estado = Column(String(20), nullable=False)
    token_qr = Column(String(255), nullable=False)
    __table_args__ = (UniqueConstraint('clase_id', 'alumno_id', name='_clase_alumno_uc'),)