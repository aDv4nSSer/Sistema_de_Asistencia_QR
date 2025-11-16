from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.auth_utils import get_current_user_with_roles
from typing import List, Optional

# --- 👇 AÑADIDO: Imports de tiempo y zona horaria ---
from datetime import datetime, time
import pytz
from app.models import DiaSemana
# --- 👆 FIN DE LA MODIFICACIÓN ---

router = APIRouter(
    prefix="/asignaturas",
    tags=["Asignaturas y Sesiones"]
)

get_db = database.get_db
TZ_CHILE = pytz.timezone('America/Santiago')

# --- 1. Endpoints de Asignatura (Sin cambios) ---

@router.get("/", response_model=List[schemas.Asignatura])
def leer_asignaturas(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["administrador", "ti"]))
):
    """
    (Admin/TI) Obtiene una lista de TODAS las asignaturas en el sistema.
    """
    asignaturas = crud.get_asignaturas(db, skip=skip, limit=limit)
    return asignaturas

@router.get("/mis-asignaturas", response_model=List[schemas.Asignatura])
def leer_mis_asignaturas(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor"]))
):
    """
    (Profesor) Obtiene la lista de asignaturas asignadas al profesor.
    """
    asignaturas = crud.get_asignaturas_por_profesor(db, profesor_id=current_user.id)
    return asignaturas

@router.get("/mis-asignaturas-inscritas", response_model=List[schemas.Asignatura])
def leer_mis_asignaturas_inscritas(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["estudiante"]))
):
    """
    (Estudiante) Obtiene la lista de asignaturas en las que está inscrito.
    """
    asignaturas = crud.get_asignaturas_por_alumno_id(db, alumno_id=current_user.id)
    return asignaturas

@router.get("/{asignatura_id}", response_model=schemas.Asignatura)
def leer_asignatura_por_id(
    asignatura_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["administrador", "ti", "profesor"]))
):
    """
    (Admin/TI/Profesor) Obtiene detalles de una asignatura.
    """
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")
    
    if current_user.rol == "profesor" and db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
        
    return db_asignatura

# --- 2. Endpoints de SesionClase (MODIFICADO) ---

# Mapeo de 'weekday()' de Python (Lunes=0) a nuestro Enum 'DiaSemana'
DIAS_MAP = {
    0: DiaSemana.lunes,
    1: DiaSemana.martes,
    2: DiaSemana.miercoles,
    3: DiaSemana.jueves,
    4: DiaSemana.viernes,
    5: DiaSemana.sabado,
    6: DiaSemana.domingo,
}

@router.post("/{asignatura_id}/iniciar-sesion", response_model=schemas.SesionClase)
def iniciar_sesion_clase(
    asignatura_id: int,
    # El body (sesion_data) ahora es opcional y solo para 'ubicacion'
    sesion_data: Optional[schemas.SesionClaseCreate] = None, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor"]))
):
    """
    (Profesor) Inicia una nueva sesión de clase.
    NUEVA LÓGICA:
    1. Valida que el profesor pueda iniciarla (permisos).
    2. Valida que haya una clase programada (horario) para este día/hora.
    3. Revisa si la sesión ya fue creada para este día.
    4. Si no, la crea. Si ya existe, la devuelve.
    """
    
    # 1. Validación de Permisos (sin cambios)
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")
    if db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")

    # 2. Validación de Horario (NUEVA LÓGICA)
    ahora = datetime.now(TZ_CHILE)
    dia_actual_enum = DIAS_MAP[ahora.weekday()]
    hora_actual_time = ahora.time()

    horario_valido = None
    for horario in db_asignatura.horarios:
        if horario.dia_semana == dia_actual_enum:
            hora_inicio_time = time.fromisoformat(horario.hora_inicio)
            hora_fin_time = time.fromisoformat(horario.hora_fin)
            
            # Comprueba si la hora actual está dentro del rango del horario
            if hora_inicio_time <= hora_actual_time <= hora_fin_time:
                horario_valido = horario
                break
    
    if not horario_valido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No hay ninguna clase programada para '{db_asignatura.nombre}' en este momento ({dia_actual_enum.value} a las {hora_actual_time.strftime('%H:%M')})."
        )

    # 3. Revisa si la sesión ya existe para este día
    # Buscamos una sesión para esta asignatura que haya sido creada hoy
    fecha_hoy_inicio = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    fecha_hoy_fin = ahora.replace(hour=23, minute=59, second=59, microsecond=0)

    sesion_existente = db.query(models.SesionClase).filter(
        models.SesionClase.asignatura_id == asignatura_id,
        models.SesionClase.fecha >= fecha_hoy_inicio,
        models.SesionClase.fecha <= fecha_hoy_fin
    ).first()

    if sesion_existente:
        return sesion_existente

    # 4. Si no existe, la crea
    ubicacion = sesion_data.ubicacion if sesion_data else None
    
    sesion_schema_create = schemas.SesionClaseCreate(
        asignatura_id=asignatura_id,
        hora_inicio=horario_valido.hora_inicio,
        hora_fin=horario_valido.hora_fin,
        ubicacion=ubicacion
    )
    
    nueva_sesion = crud.crear_sesion_clase(db, sesion=sesion_schema_create)
    return nueva_sesion


@router.get("/{asignatura_id}/sesiones", response_model=List[schemas.SesionClase])
def leer_sesiones_por_asignatura(
    asignatura_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor", "administrador"]))
):
    """
    (Profesor/Admin) Obtiene la lista de sesiones de clase (días)
    que se han creado para una asignatura. (Sin cambios)
    """
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")

    if current_user.rol == "profesor" and db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
    
    return crud.get_sesiones_por_asignatura(db, asignatura_id=asignatura_id)