from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request # <-- MODIFICADO
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import database, schemas, auth_utils 

# --- AÑADIDO ---
from app.limiter import limiter # Importamos nuestra instancia
# --- FIN DE LA MODIFICACIÓN ---

router = APIRouter(
    tags=["Autenticación"]
)

@router.post("/token", response_model=schemas.Token)
# --- MODIFICADO (1/2): APLICAMOS EL LÍMITE ---
@limiter.limit("5/minute") # Límite: 5 intentos por minuto por IP
def login_for_access_token(
    response: Response,
    request: Request, # <-- AÑADIDO: 'request' es necesario para el limiter
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
    # --- FIN DE LA MODIFICACIÓN (1/2) ---
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
    
    access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol, "id": usuario.id, "nombre": usuario.nombre}
    )

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
    
    new_access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol, "id": usuario.id, "nombre": usuario.nombre}
    )
    
    return {"access_token": new_access_token, "token_type": "bearer"}
