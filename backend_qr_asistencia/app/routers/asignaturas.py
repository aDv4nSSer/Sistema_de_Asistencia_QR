from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.auth_utils import get_current_user_with_roles
from typing import List, Optional

router = APIRouter(
    prefix="/asignaturas", # <-- MODIFICADO
    tags=["Asignaturas y Sesiones"]
)

get_db = database.get_db

# --- 1. Endpoints de Asignatura ---

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
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id=asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")
    
    if current_user.rol == "profesor" and db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
        
    return db_asignatura

# --- 2. Endpoints de SesionClase (NUEVO) ---

@router.post("/{asignatura_id}/iniciar-sesion", response_model=schemas.SesionClase)
def iniciar_sesion_clase(
    asignatura_id: int,
    # Opcionalmente, el profesor puede enviar detalles
    sesion_data: Optional[schemas.SesionClaseCreate] = None, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor"]))
):
    """
    (Profesor) Inicia una nueva sesión de clase para una asignatura.
    Esto es lo que crea la "clase del día" para tomar asistencia.
    """
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id=asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")
    if db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")

    # Preparamos los datos de la sesión
    if sesion_data:
        sesion_data.asignatura_id = asignatura_id
    else:
        sesion_data = schemas.SesionClaseCreate(asignatura_id=asignatura_id)

    nueva_sesion = crud.crear_sesion_clase(db, sesion=sesion_data)
    return nueva_sesion

# --- 👇 AÑADIDO ---
@router.get("/{asignatura_id}/sesiones", response_model=List[schemas.SesionClase])
def leer_sesiones_por_asignatura(
    asignatura_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["profesor", "administrador"]))
):
    """
    (Profesor/Admin) Obtiene la lista de sesiones de clase (días)
    que se han creado para una asignatura.
    """
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")

    if current_user.rol == "profesor" and db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
    
    return crud.get_sesiones_por_asignatura(db, asignatura_id=asignatura_id)
# --- 👆 FIN ---