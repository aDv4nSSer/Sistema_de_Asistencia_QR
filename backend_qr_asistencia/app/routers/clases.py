# clases.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database
from app.auth_utils import get_current_user_with_roles

router = APIRouter(
    prefix="/clases",
    tags=["clases"]
)

get_db = database.get_db

@router.post("/", response_model=schemas.Clase, status_code=status.HTTP_201_CREATED) # 👈 ¡USAR schemas.Clase!
def crear_clase(
    clase: schemas.ClaseCreate, 
    db: Session = Depends(get_db),
    # Solo un profesor puede crear una clase
    current_user=Depends(get_current_user_with_roles(["profesor"])) 
):
    """
    Crea un nuevo registro de clase en la base de datos.
    """
    # Opcional: Podrías verificar si el profesor_id coincide con el current_user.id
    if current_user.id != clase.profesor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear una clase a nombre de otro profesor."
        )
        
    nueva_clase = crud.crear_clase(db, clase)
    return nueva_clase