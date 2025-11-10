from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import database, schemas, auth_utils 

router = APIRouter(
    tags=["Autenticación"]
)

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """
    Endpoint de inicio de sesión.
    """
    usuario = auth_utils.authenticate_user(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # --- 👇 MODIFICACIÓN (Paso 1.1) ---
    # ¡Añadimos "nombre": usuario.nombre al token!
    access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol, "id": usuario.id, "nombre": usuario.nombre}
    )
    # --- 👆 FIN DE LA MODIFICACIÓN ---

    refresh_token = auth_utils.create_refresh_token(
        data={"sub": usuario.email}
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True, 
        samesite="strict", 
        secure=True, 
        max_age=60*60*24*7 # 7 días
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token/refresh", response_model=schemas.Token)
def refresh_access_token(
    refresh_token: str = Cookie(None), 
    db: Session = Depends(database.get_db)
):
    """
    Genera un nuevo access_token usando el refresh_token.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró refresh token"
        )
        
    usuario = auth_utils.verify_refresh_token(db, refresh_token) 
    
    # --- 👇 MODIFICACIÓN (Paso 1.2) ---
    # ¡Añadimos "nombre": usuario.nombre también al refrescar!
    new_access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol, "id": usuario.id, "nombre": usuario.nombre}
    )
    # --- 👆 FIN DE LA MODIFICACIÓN ---
    
    return {"access_token": new_access_token, "token_type": "bearer"}