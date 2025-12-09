from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
# --- MODIFICADO: Importamos los nuevos modelos/schemas ---
from app import models, schemas
from app.models import Horario, DiaSemana
# --- FIN DE LA MODIFICACIÓN ---
from datetime import datetime, timedelta
from app.auth_utils import get_password_hash
import pytz

TZ_CHILE = pytz.timezone('America/Santiago')

# --- 1. CRUD de Usuarios (Sin cambios) ---
def get_usuario(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def get_usuario_por_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).offset(skip).limit(limit).all()

def get_usuarios_por_rol(db: Session, rol: str, skip: int = 0, limit: int = 100):
    return db.query(models.Usuario).filter(models.Usuario.rol == rol).offset(skip).limit(limit).all()

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate):
    hashed_password = get_password_hash(usuario.contrasena)
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        rol=usuario.rol,
        activo=usuario.activo,
        contrasena_hash=hashed_password  
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def update_usuario(db: Session, usuario_id: int, usuario_update: schemas.UsuarioUpdate):
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return None
    update_data = usuario_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int):
    db_usuario = get_usuario(db, usuario_id)
    if not db_usuario:
        return None
    db_usuario.activo = False
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def crear_usuarios_bulk(db: Session, usuarios: List[schemas.UsuarioCreate]):
    exitosos = 0
    fallidos = 0
    detalles_fallidos = []

    for user_schema in usuarios:
        db_user = get_usuario_por_email(db, email=user_schema.email)
        if db_user:
            detalles_fallidos.append(f"Email ya existe: {user_schema.email}")
            fallidos += 1
            continue 
            
        try:
            hashed_password = get_password_hash(user_schema.contrasena)
            db_usuario = models.Usuario(
                nombre=user_schema.nombre,
                email=user_schema.email,
                rol=user_schema.rol,
                activo=user_schema.activo,
                contrasena_hash=hashed_password  
            )
            db.add(db_usuario)
            exitosos += 1
        except Exception as e:
            detalles_fallidos.append(f"Error con {user_schema.email}: {str(e)}")
            fallidos += 1
            db.rollback() 
    
    if exitosos > 0:
        db.commit()
        
    return {"exitosos": exitosos, "fallidos": fallidos, "detalles_fallidos": detalles_fallidos}

# --- 2. CRUD de Asignatura (Sin cambios) ---
def get_asignatura_por_id(db: Session, asignatura_id: int):
    return db.query(models.Asignatura).filter(models.Asignatura.id == asignatura_id)\
        .options(
            joinedload(models.Asignatura.profesor),
            joinedload(models.Asignatura.alumnos_inscritos),
            joinedload(models.Asignatura.horarios) # <-- Añadimos precarga de horarios
        ).first()

def get_asignaturas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asignatura).options(
        joinedload(models.Asignatura.profesor),
        joinedload(models.Asignatura.horarios) # <-- Añadimos precarga de horarios
    ).offset(skip).limit(limit).all()

def get_asignaturas_por_profesor(db: Session, profesor_id: int):
    return db.query(models.Asignatura).filter(models.Asignatura.profesor_id == profesor_id)\
        .options(joinedload(models.Asignatura.horarios)).all() # <-- Añadimos precarga de horarios

def get_asignaturas_por_alumno_id(db: Session, alumno_id: int):
    usuario = get_usuario(db, alumno_id)
    if usuario:
        # Cargamos los horarios de cada asignatura inscrita
        usuario.asignaturas_inscritas.options = joinedload(models.Asignatura.horarios)
        return usuario.asignaturas_inscritas
    return []

def crear_asignatura(db: Session, asignatura: schemas.AsignaturaCreate):
    db_asignatura = models.Asignatura(
        nombre=asignatura.nombre,
        profesor_id=asignatura.profesor_id,
        codigo=asignatura.codigo
    )
    db.add(db_asignatura)
    db.commit()
    db.refresh(db_asignatura)
    return db_asignatura

# --- 3. CRUD de Inscripciones (Sin cambios) ---
def verificar_inscripcion(db: Session, alumno_id: int, asignatura_id: int) -> bool:
    inscripcion = db.query(models.inscripciones_alumnos).filter(
        models.inscripciones_alumnos.c.alumno_id == alumno_id,
        models.inscripciones_alumnos.c.asignatura_id == asignatura_id
    ).first()
    return inscripcion is not None

def inscribir_alumno_en_asignatura(db: Session, alumno_id: int, asignatura_id: int):
    db_asignatura = get_asignatura_por_id(db, asignatura_id)
    db_alumno = get_usuario(db, alumno_id)
    if not db_asignatura: raise Exception("Asignatura no encontrada")
    if not db_alumno: raise Exception("Alumno no encontrado")
    if db_alumno in db_asignatura.alumnos_inscritos:
        return db_asignatura 
    db_asignatura.alumnos_inscritos.append(db_alumno)
    db.commit()
    db.refresh(db_asignatura)
    return db_asignatura

def desinscribir_alumno_de_asignatura(db: Session, alumno_id: int, asignatura_id: int):
    db_asignatura = get_asignatura_por_id(db, asignatura_id)
    db_alumno = get_usuario(db, alumno_id)
    if not db_asignatura: raise Exception("Asignatura no encontrada")
    if not db_alumno: raise Exception("Alumno no encontrado")
    if db_alumno not in db_asignatura.alumnos_inscritos:
        return db_asignatura 
    db_asignatura.alumnos_inscritos.remove(db_alumno)
    db.commit()
    db.refresh(db_asignatura)
    return db_asignatura

# --- 4. CRUD de SesionClase (Sin cambios) ---
def crear_sesion_clase(db: Session, sesion: schemas.SesionClaseCreate) -> models.SesionClase:
    db_sesion = models.SesionClase(
        asignatura_id=sesion.asignatura_id,
        fecha=datetime.now(TZ_CHILE), 
        hora_inicio=sesion.hora_inicio,
        hora_fin=sesion.hora_fin,
        ubicacion=sesion.ubicacion
    )
    db.add(db_sesion)
    db.commit()
    db.refresh(db_sesion)
    return db_sesion

def get_sesion_clase_por_id(db: Session, sesion_id: int):
    return db.query(models.SesionClase).filter(models.SesionClase.id == sesion_id).first()

def get_sesiones_por_asignatura(db: Session, asignatura_id: int):
    return db.query(models.SesionClase).filter(models.SesionClase.asignatura_id == asignatura_id).all()

# --- 5. CRUD de Asistencia y QR (Sin cambios) ---
def create_asistencia(db: Session, asistencia: schemas.AsistenciaCreate):
    db_asistencia = models.Asistencia(
        sesion_clase_id = asistencia.sesion_clase_id, 
        alumno_id = asistencia.alumno_id,
        timestamp = asistencia.timestamp,
        estado = asistencia.estado,
        token_qr = asistencia.token_qr,
        lat = asistencia.lat,
        lng = asistencia.lng
    )
    db.add(db_asistencia)
    db.commit()
    db.refresh(db_asistencia)
    return db_asistencia

def crear_token_asistencia(db: Session, sesion_id: int, expira_en_minutos: int = 2) -> models.TokenAsistencia:
    fecha_expiracion = datetime.now(TZ_CHILE) + timedelta(minutes=expira_en_minutos)
    db_token = models.TokenAsistencia(
        sesion_clase_id=sesion_id, 
        fecha_expiracion=fecha_expiracion
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def get_token_asistencia_por_uuid(db: Session, token: str) -> models.TokenAsistencia | None:
    return db.query(models.TokenAsistencia).filter(models.TokenAsistencia.token == token)\
        .options(
            joinedload(models.TokenAsistencia.sesion_clase)
            .joinedload(models.SesionClase.asignatura)
        ).first()

def borrar_token_asistencia(db: Session, token_id: int):
    db_token = db.query(models.TokenAsistencia).filter(models.TokenAsistencia.id == token_id).first()
    if db_token:
        db.delete(db_token)
        db.commit()

# --- 6. CRUD de Reportes (Sin cambios) ---
def get_asistencia_por_sesion(db: Session, sesion_id: int):
    return db.query(models.Asistencia).filter(models.Asistencia.sesion_clase_id == sesion_id)\
        .options(joinedload(models.Asistencia.alumno)).all()

def get_asistencia_por_alumno(db: Session, alumno_id: int):
    return db.query(models.Asistencia).filter(models.Asistencia.alumno_id == alumno_id)\
        .options(
            joinedload(models.Asistencia.sesion_clase)
            .joinedload(models.SesionClase.asignatura)
        ).all()

def get_reporte_asistencia_asignatura(db: Session, asignatura_id: int):
    total_sesiones = db.query(func.count(models.SesionClase.id))\
        .filter(models.SesionClase.asignatura_id == asignatura_id).scalar()
    
    if total_sesiones == 0:
        return {"total_sesiones": 0, "alumnos": []}

    alumnos_inscritos = db.query(models.Usuario)\
        .join(models.inscripciones_alumnos, models.Usuario.id == models.inscripciones_alumnos.c.alumno_id)\
        .filter(models.inscripciones_alumnos.c.asignatura_id == asignatura_id).all()

    conteo_asistencias = db.query(
            models.Asistencia.alumno_id,
            func.count(models.Asistencia.id).label('presente')
        )\
        .join(models.SesionClase, models.Asistencia.sesion_clase_id == models.SesionClase.id)\
        .filter(models.SesionClase.asignatura_id == asignatura_id)\
        .group_by(models.Asistencia.alumno_id).all()

    conteo_map = {r.alumno_id: r.presente for r in conteo_asistencias}

    reporte_final = []
    for alumno in alumnos_inscritos:
        presente = conteo_map.get(alumno.id, 0)
        porcentaje = (presente / total_sesiones) * 100 if total_sesiones > 0 else 0
        reporte_final.append({
            "alumno_id": alumno.id,
            "nombre": alumno.nombre,
            "email": alumno.email,
            "sesiones_asistidas": presente,
            "porcentaje_asistencia": round(porcentaje, 2)
        })

    return {"total_sesiones": total_sesiones, "alumnos": reporte_final}

# --- AÑADIDO: 7. CRUD de Horario ---

def crear_horario(db: Session, horario: schemas.HorarioCreate) -> models.Horario:
    """
    Crea un nuevo horario para una asignatura.
    """
    db_horario = models.Horario(
        asignatura_id=horario.asignatura_id,
        dia_semana=horario.dia_semana,
        hora_inicio=horario.hora_inicio,
        hora_fin=horario.hora_fin
    )
    db.add(db_horario)
    db.commit()
    db.refresh(db_horario)
    return db_horario

def delete_horario(db: Session, horario_id: int) -> models.Horario | None:
    """
    Elimina un horario por su ID.
    """
    db_horario = db.query(models.Horario).filter(models.Horario.id == horario_id).first()
    if db_horario:
        db.delete(db_horario)
        db.commit()
    return db_horario
# --- FIN DE LA MODIFICACIÓN ---
