from fastapi import APIRouter, Depends, HTTPException, status, Request # <-- MODIFICADO
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.auth_utils import get_current_user_with_roles
from typing import List
from app.limiter import limiter # <-- AÑADIDO
from datetime import datetime # <-- AÑADIDO
import pytz # <-- AÑADIDO

# Definir zona horaria
TZ_CHILE = pytz.timezone('America/Santiago')

router = APIRouter(
    prefix="/asistencia",
    tags=["asistencia"]
)

get_db = database.get_db

@router.get("/mi-historial", response_model=List[schemas.AsistenciaConSesionInfo])
def leer_mi_historial_de_asistencia(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["estudiante"]))
):
    """
    Obtiene el historial de asistencia del estudiante autenticado.
    """
    asistencias = crud.get_asistencia_por_alumno(db, alumno_id=current_user.id)
    return asistencias

# --- AÑADIDO: Endpoint para OBTENER lista detallada (Presentes + Ausentes) ---
@router.get("/sesiones/{sesion_id}/asistencia-detallada", response_model=List[schemas.AsistenciaDetalladaAlumno])
def leer_asistencia_detallada_por_sesion(
    sesion_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor"]))
):
    """
    (Profesor) Obtiene la lista COMPLETA de alumnos inscritos para una sesión,
    marcando quién está 'presente' y quién 'ausente'.
    """
    sesion = crud.get_sesion_clase_por_id(db, sesion_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    asignatura = sesion.asignatura
    if not asignatura:
         raise HTTPException(status_code=404, detail="Asignatura no encontrada para esta sesión")

    # Security Check
    if asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre esta asignatura")
        
    alumnos_inscritos = asignatura.alumnos_inscritos
    asistencias_presentes = crud.get_asistencia_por_sesion(db, sesion_id)
    
    presentes_map = {a.alumno_id: a for a in asistencias_presentes}
    
    lista_final = []
    for alumno in alumnos_inscritos:
        asistencia_record = presentes_map.get(alumno.id)
        if asistencia_record:
            # Alumno PRESENTE
            lista_final.append(schemas.AsistenciaDetalladaAlumno(
                id=alumno.id,
                nombre=alumno.nombre,
                email=alumno.email,
                estado=asistencia_record.estado,
                timestamp=asistencia_record.timestamp,
                asistencia_id=asistencia_record.id
            ))
        else:
            # Alumno AUSENTE
            lista_final.append(schemas.AsistenciaDetalladaAlumno(
                id=alumno.id,
                nombre=alumno.nombre,
                email=alumno.email,
                estado="ausente",
                timestamp=None,
                asistencia_id=None
            ))
    return lista_final

# --- AÑADIDO: Endpoint para CREAR asistencia (Justificar) ---
@router.post("/manual", response_model=schemas.AsistenciaConAlumnoInfo)
@limiter.limit("20/minute") # Limitar para evitar abuso
def registrar_asistencia_manual(
    request: Request, # Requerido por el limiter
    asistencia_data: schemas.AsistenciaManualCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor"]))
):
    """
    (Profesor) Registra manualmente la asistencia de un alumno para una sesión.
    Usado para justificar inasistencias.
    """
    sesion = crud.get_sesion_clase_por_id(db, asistencia_data.sesion_clase_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    if sesion.asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para esta asignatura")
    
    alumno = crud.get_usuario(db, asistencia_data.alumno_id)
    if not alumno or alumno.rol != 'estudiante':
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    if alumno not in sesion.asignatura.alumnos_inscritos:
            raise HTTPException(status_code=403, detail="El alumno no está inscrito en esta asignatura")
    
    # Verificar si ya existe asistencia
    asistencia_existente = db.query(models.Asistencia).filter(
        models.Asistencia.sesion_clase_id == asistencia_data.sesion_clase_id,
        models.Asistencia.alumno_id == asistencia_data.alumno_id
    ).first()
    
    if asistencia_existente:
        raise HTTPException(status_code=409, detail="Este alumno ya tiene una asistencia registrada.")

    # Crear la nueva asistencia
    asistencia_schema = schemas.AsistenciaCreate(
        sesion_clase_id=asistencia_data.sesion_clase_id,
        alumno_id=asistencia_data.alumno_id,
        timestamp=datetime.now(TZ_CHILE),
        estado=asistencia_data.estado,
        token_qr="MANUAL_POR_PROFESOR", # Token especial
        lat=None,
        lng=None
    )
    
    try:
        db_asistencia = crud.create_asistencia(db=db, asistencia=asistencia_schema)
        db.refresh(db_asistencia) # Cargar relaciones (como el alumno)
        return db_asistencia
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")
