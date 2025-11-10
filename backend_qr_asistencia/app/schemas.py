from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
import uuid 
from typing import List, Optional

# --- 1. Schemas de Usuario (Sin cambios) ---

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., alias="contraseña")  
    class Config:
        populate_by_name = True  

class Usuario(UsuarioBase):
    id: int
    email: EmailStr
    rol: str
    class Config:
        from_attributes = True

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    class Config:
        from_attributes = True

class UsuarioInfo(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- 2. Schemas de Asignatura (Clase -> Asignatura) ---

class AsignaturaCreate(BaseModel):
    nombre: str
    profesor_id: int
    codigo: Optional[str] = None

class Asignatura(AsignaturaCreate): 
    id: int 
    profesor: Optional[UsuarioInfo] = None
    alumnos_inscritos: List[UsuarioInfo] = []
    
    class Config:
        from_attributes = True 

# --- 3. Schemas de SesionClase (NUEVO) ---

class SesionClaseCreate(BaseModel):
    asignatura_id: int
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    ubicacion: Optional[str] = None

class SesionClase(SesionClaseCreate):
    id: int
    fecha: datetime
    
    class Config:
        from_attributes = True


# --- 4. Schemas de Asistencia (MODIFICADO) ---

class AsistenciaCreate(BaseModel):
    sesion_clase_id: int # <-- MODIFICADO
    alumno_id: int
    timestamp: datetime
    estado: str
    token_qr: str 
    lat: float | None = None
    lng: float | None = None

# Este es el payload que envía el alumno
class AsistenciaToken(BaseModel):
    qr_token: str # El UUID del TokenAsistencia
    lat: float 
    lng: float 

# --- 5. Schemas de TokenAsistencia (MODIFICADO) ---

class TokenAsistenciaCreate(BaseModel):
    sesion_clase_id: int # <-- MODIFICADO
    fecha_expiracion: datetime

class TokenAsistencia(BaseModel):
    id: int
    token: uuid.UUID
    sesion_clase_id: int # <-- MODIFICADO
    fecha_expiracion: datetime
    creado_en: datetime

    class Config:
        from_attributes = True

# --- 6. Schemas de Historial (MODIFICADO) ---

# Schema para la Asistencia (vista Profesor y Admin)
class AsistenciaConAlumnoInfo(BaseModel):
    id: int
    timestamp: datetime
    estado: str
    alumno: UsuarioInfo 
    
    class Config:
        from_attributes = True

# Info simplificada de Asignatura y Sesión
class AsignaturaInfo(BaseModel):
    id: int
    nombre: str
    codigo: Optional[str] = None
    class Config:
        from_attributes = True

class SesionClaseInfo(BaseModel):
    id: int
    fecha: datetime
    asignatura: AsignaturaInfo # Anidado
    class Config:
        from_attributes = True

# Schema para la Asistencia (vista Estudiante)
class AsistenciaConSesionInfo(BaseModel):
    id: int
    timestamp: datetime
    estado: str
    sesion_clase: SesionClaseInfo # Anidado
    
    class Config:
        from_attributes = True

# --- Schemas Antiguos (Comentados/Eliminados) ---
# Ya no necesitamos QrCodeCreate, QrCode
# Ya no necesitamos ClaseCreate, Clase, ClaseInfo
# AsistenciaConClaseInfo -> AsistenciaConSesionInfo

# (Estos parecen no usarse, los dejo por si acaso)
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

class BulkUserCreateRequest(BaseModel):
    usuarios: List[UsuarioCreate]

class BulkUserCreateResponse(BaseModel):
    exitosos: int
    fallidos: int
    detalles_fallidos: List[str]