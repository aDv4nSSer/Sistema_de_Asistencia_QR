from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database
from app.auth_utils import get_current_user, get_current_user_with_roles
from app.config import ROLES
from typing import List, Optional # <-- AÑADIDO

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

get_db = database.get_db

# --- 👇 AÑADIDO: Listar usuarios (para Admin/TI) ---
@router.get("/", response_model=List[schemas.Usuario])
def leer_usuarios(
    rol: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_with_roles([ROLES["ADMIN"], ROLES["TI"]]))
):
    """
    (Admin/TI) Obtiene una lista de usuarios.
    - Permite filtrar por rol (ej: ?rol=estudiante)
    """
    if rol:
        if rol not in ROLES.values():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rol no válido")
        usuarios = crud.get_usuarios_por_rol(db, rol=rol, skip=skip, limit=limit)
    else:
        usuarios = crud.get_usuarios(db, skip=skip, limit=limit)
    return usuarios
# --- 👆 FIN DE LA MODIFICACIÓN ---


@router.post("/", response_model=schemas.Usuario)
def crear_usuario(
    usuario: schemas.UsuarioCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_with_roles([ROLES["TI"]])) # <-- SÓLO TI
):
     db_usuario = crud.get_usuario_por_email(db, email=usuario.email)
     if db_usuario:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado")
     nuevo_usuario = crud.crear_usuario(db, usuario)
     return nuevo_usuario

@router.post("/bulk", response_model=schemas.BulkUserCreateResponse, status_code=status.HTTP_201_CREATED)
def crear_usuarios_en_masa(
    request: schemas.BulkUserCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_with_roles([ROLES["TI"]])) # SÓLO TI
):
    """
    (TI) Crea múltiples usuarios en una sola petición (desde un CSV).
    """
    if not request.usuarios:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La lista de usuarios está vacía")
        
    resultado = crud.crear_usuarios_bulk(db, usuarios=request.usuarios)
    
    return resultado

@router.put("/{usuario_id}", response_model=schemas.Usuario)
def actualizar_usuario(
    usuario_id: int,
    usuario_update: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_with_roles([ROLES["TI"]])) # SÓLO TI
):
    """
    (TI) Actualiza la información de un usuario (Nombre, Rol, Activo).
    """
    db_usuario = crud.update_usuario(db, usuario_id, usuario_update)
    if not db_usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return db_usuario

@router.delete("/{usuario_id}", response_model=schemas.Usuario)
def desactivar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_with_roles([ROLES["TI"]])) # SÓLO TI
):
    """
    (TI) Desactiva un usuario (lo marca como activo=False).
    """
    db_usuario = crud.delete_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return db_usuario

@router.get("/me", response_model=schemas.Usuario)
def read_users_me(current_user: schemas.Usuario = Depends(get_current_user)):
    return current_user


@router.get("/admin-only")
def admin_only_route(user = Depends(get_current_user_with_roles([ROLES["ADMIN"]]))):
    return {"msg": f"Hola, administrador {user.nombre}"}


@router.get("/profesores-y-ti")
def prof_ti_route(user = Depends(get_current_user_with_roles([ROLES["PROFESOR"], ROLES["TI"]]))):
    return {"msg": f"Hola, {user.rol} {user.nombre}"}


@router.get("/todos")
def any_role_route(user = Depends(get_current_user_with_roles(list(ROLES.values())))):
    return {"msg": f"Hola {user.rol} {user.nombre}"}