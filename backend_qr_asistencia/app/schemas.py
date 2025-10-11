from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., alias="contraseña")  # 👈 alias para JSON

    class Config:
        populate_by_name = True  # permite usar tanto contrasena como contraseña

class Usuario(UsuarioBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SessionCreate(BaseModel):
    session_id: str
    valid_from: datetime
    valid_until: datetime
    lat: float
    lng: float
    radius_meters: float

class AttendanceCreate(BaseModel):
    session_id: str
    timestamp: datetime
    lat: float
    lng: float

class ClaseCreate(BaseModel):
    nombre: str
    profesor_id: int
    fecha: date
    hora_inicio: str
    hora_fin: str
    ubicacion: str | None = None

class Clase(ClaseCreate): # Hereda de ClaseCreate
    id: int # Agregamos el ID
    
    class Config:
        from_attributes = True # Equivalente a orm_mode=True en versiones anteriores

class QrCodeCreate(BaseModel):
    clase_id: int
    qr_hash: str
    fecha_creacion: datetime
    fecha_expiracion: datetime
    ubicacion_permitida: str | None = None

class QrCode(QrCodeCreate): # Hereda de QrCodeCreate
    id: int # Agregamos el ID
    
    class Config:
        from_attributes = True # Para que SQLAlchemy sepa mapear el objeto

class AsistenciaCreate(BaseModel):
    clase_id: int
    alumno_id: int
    timestamp: datetime
    estado: str
    token_qr: str

class AsistenciaRequest(BaseModel):
    clase_id: int
    alumno_id: int
    timestamp: datetime
    estado: str
    token_qr: str