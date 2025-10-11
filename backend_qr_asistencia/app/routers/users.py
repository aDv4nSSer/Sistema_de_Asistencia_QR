from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud, database
from app.auth_utils import get_current_user, get_current_user_with_roles
from app.config import ROLES


router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

get_db = database.get_db


@router.post("/", response_model=schemas.Usuario)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
     db_usuario = crud.get_usuario_por_email(db, email=usuario.email)
     if db_usuario:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email ya registrado")
     nuevo_usuario = crud.crear_usuario(db, usuario)
     return nuevo_usuario


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
