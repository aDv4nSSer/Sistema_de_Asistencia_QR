# app/auth_utils.py
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
# Quitamos 'crud' de esta importación para romper el círculo
from app import database
from app.schemas import Usuario

# Definimos todo lo que 'crud.py' podría importar ANTES de nada
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- FIN DE LA SECCIÓN IMPORTANTE ---


def authenticate_user(db: Session, email: str, password: str):
    # Importamos 'crud' aquí dentro
    from app import crud 
    usuario = crud.get_usuario_por_email(db, email)
    if not usuario or not verify_password(password, usuario.contrasena_hash):
        return None
    return usuario

# --- Lógica de Access Token ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)):
    # Importamos 'crud' aquí dentro
    from app import crud
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
            
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    usuario = crud.get_usuario_por_email(db, email)
    if usuario is None:
        raise credentials_exception
    return usuario

# --- Lógica de Refresh Token ---
def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_refresh_token(db: Session, token: str) -> Usuario:
    # Importamos 'crud' aquí dentro
    from app import crud

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token inválido o expirado"
    )
    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    usuario = crud.get_usuario_por_email(db, email)
    if usuario is None:
        raise credentials_exception
    return usuario


def get_current_user_with_roles(required_roles: List[str]):
    def role_dependency(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de estos roles: {', '.join(required_roles)}",
            )
        return current_user
    return role_dependency