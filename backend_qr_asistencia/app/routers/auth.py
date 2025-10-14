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
    Verifica las credenciales y devuelve un access_token en el cuerpo
    y un refresh_token en una cookie segura HttpOnly.
    """
    usuario = auth_utils.authenticate_user(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Crear ambos tokens
    access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol}
    )
    refresh_token = auth_utils.create_refresh_token(
        data={"sub": usuario.email}
    )
    
    # Guardar el refresh token en una cookie segura HttpOnly
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True, # Impide que el JavaScript del frontend la lea.
        samesite="strict", # Ayuda a prevenir ataques CSRF.
        secure=True, # En producción, solo se enviará sobre HTTPS.
        max_age=60*60*24*7 # 7 días de duración
    )
    
    # Devolver el access token en el cuerpo de la respuesta
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token/refresh", response_model=schemas.Token)
def refresh_access_token(
    refresh_token: str = Cookie(None), # Extrae el refresh_token de la cookie.
    db: Session = Depends(database.get_db)
):
    """
    Genera un nuevo access_token usando el refresh_token
    que se envía automáticamente en la cookie.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró refresh token"
        )
        
    # Verificar el refresh token para obtener los datos del usuario
    usuario = auth_utils.verify_refresh_token(db, refresh_token)
    
    # Generar un nuevo access token para el usuario
    new_access_token = auth_utils.create_access_token(
        data={"sub": usuario.email, "rol": usuario.rol}
    )
    
    return {"access_token": new_access_token, "token_type": "bearer"}

