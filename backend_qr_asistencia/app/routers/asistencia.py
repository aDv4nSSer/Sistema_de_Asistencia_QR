from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database, models
from app.auth_utils import get_current_user_with_roles
from typing import List

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