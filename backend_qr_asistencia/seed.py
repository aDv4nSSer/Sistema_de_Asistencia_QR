import os
import sys
from dotenv import load_dotenv, find_dotenv

# 1. Añadir el directorio del proyecto al path de Python
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)
print(f"Directorio del proyecto añadido al path: {script_dir}")

# 2. Cargar las variables de entorno (.env)
env_path = find_dotenv(".env")
if not env_path:
    print("Error: No se encontró el archivo .env.")
    exit()
load_dotenv(dotenv_path=env_path) 
print("Cargando variables de entorno...")

# 3. Importar los componentes de la app
try:
    from app.database import engine, Base, SessionLocal
    from app.models import Usuario
    from app import schemas
    from app import crud
except ImportError as e:
    print(f"Error de importación: {e}")
    print("Asegúrate de que tu entorno virtual ('venv') esté activado.")
    exit()
        
# 4. Crear una sesión de DB
try:
    db = SessionLocal()
except Exception as e:
    print(f"Error al crear SessionLocal(): {e}")
    exit()

def seed_database():
    print("Iniciando el proceso de siembra (seed)...")
    
    # 5. Crear todas las tablas (en una BBDD vacía)
    try:
        print("Creando tablas nuevas...")
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error al conectar o crear tablas: {e}")
        return

    # 6. Definir los usuarios administradores
    admin_users = [
        schemas.UsuarioCreate(
            nombre="Usuario TI",
            email="ti@test.com",
            contrasena="ti123",
            rol="ti",
            activo=True
        ),
        schemas.UsuarioCreate(
            nombre="Usuario Administrador",
            email="admin@test.com",
            contrasena="admin123",
            rol="administrador",
            activo=True
        )
    ]

    # 7. Crear los usuarios en la DB
    for user_schema in admin_users:
        db_user = crud.get_usuario_por_email(db, email=user_schema.email)
        if db_user:
            print(f"El usuario {user_schema.email} ya existe. Omitiendo.")
        else:
            try:
                crud.crear_usuario(db=db, usuario=user_schema)
                print(f"Usuario {user_schema.email} creado exitosamente.")
            except Exception as e:
                print(f"Error al crear usuario {user_schema.email}: {e}")
                db.rollback()

    print("Proceso de siembra finalizado.")

# 8. Ejecutar el script
if __name__ == "__main__":
    try:
        seed_database()
    finally:
        print("Cerrando sesión de base de datos.")
        db.close()