from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.auth_utils import get_current_user_with_roles
from typing import List, Any # <-- AÑADIDO

router = APIRouter(
    prefix="/gestion",
    tags=["Gestión (TI & Admin)"]
)

get_db = database.get_db

# --- GESTIÓN DE ASIGNATURAS (Rol: TI) ---

@router.post("/asignaturas/", response_model=schemas.Asignatura, status_code=status.HTTP_201_CREATED)
def crear_nueva_asignatura(
    asignatura: schemas.AsignaturaCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["ti"])) 
):
    """
    (TI) Crea una nueva asignatura (curso) en la base de datos.
    """
    db_profesor = crud.get_usuario(db, asignatura.profesor_id)
    if not db_profesor or db_profesor.rol != "profesor":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El ID de profesor proporcionado no existe o no tiene el rol 'profesor'."
        )
        
    nueva_asignatura = crud.crear_asignatura(db, asignatura)
    return nueva_asignatura

# --- GESTIÓN DE INSCRIPCIONES (Rol: TI o Admin) ---

@router.post("/asignatura/{asignatura_id}/inscribir/{alumno_id}", status_code=status.HTTP_201_CREATED)
def inscribir_alumno(
    asignatura_id: int,
    alumno_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["ti", "administrador"]))
):
    """
    (TI/Admin) Inscribe un alumno en una asignatura.
    """
    try:
        db_alumno = crud.get_usuario(db, alumno_id)
        if not db_alumno or db_alumno.rol != "estudiante":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El ID de alumno proporcionado no existe o no tiene el rol 'estudiante'."
            )
        
        crud.inscribir_alumno_en_asignatura(db, alumno_id=alumno_id, asignatura_id=asignatura_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    
    return {"message": "Alumno inscrito correctamente"}

@router.delete("/asignatura/{asignatura_id}/inscribir/{alumno_id}", status_code=status.HTTP_200_OK)
def desinscribir_alumno(
    asignatura_id: int,
    alumno_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user_with_roles(["ti", "administrador"]))
):
    """
    (TI/Admin) Desinscribe un alumno de una asignatura.
    """
    try:
        crud.desinscribir_alumno_de_asignatura(db, alumno_id=alumno_id, asignatura_id=asignatura_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    
    return {"message": "Alumno desinscrito correctamente"}

# --- GESTIÓN DE REPORTES (Rol: Admin) ---

@router.get("/asignatura/{asignatura_id}/reporte-asistencia", response_model=Any)
def reporte_asistencia_por_asignatura(
    asignatura_id: int,
    db: Session = Depends(get_db),
    # --- 👇 MODIFICADO ---
    current_user: models.Usuario = Depends(get_current_user_with_roles(["administrador", "profesor"]))
):
    """
    (Admin/Profesor) Obtiene el reporte de % de asistencia de todos los alumnos
    inscritos en una asignatura.
    """
    db_asignatura = crud.get_asignatura_por_id(db, asignatura_id)
    if not db_asignatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada")
        
    # --- 👇 AÑADIDO (Seguridad para Profesor) ---
    if current_user.rol == "profesor" and db_asignatura.profesor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta asignatura")
    # --- 👆 FIN ---
        
    reporte = crud.get_reporte_asistencia_asignatura(db, asignatura_id=asignatura_id)
    return reporte