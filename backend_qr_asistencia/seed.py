import os
import sys
from dotenv import load_dotenv, find_dotenv
import time # Para el contador de seguridad

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
    # --- 👇 MODIFICADO: Importamos Base y engine ---
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
    
    # --- 👇 AÑADIDO: Lógica de Reseteo ---
    # Comprueba si se pasó el argumento '--reset'
    if '--reset' in sys.argv:
        print("\n--- ¡ADVERTENCIA MÁXIMA! ---")
        print("Argumento '--reset' detectado.")
        print("Esto eliminará TODAS las tablas y TODOS los datos de la base de datos.")
        print("Se usará para aplicar cambios estructurales (de models.py).")
        print("-----------------------------")
        
        # Contador de seguridad para cancelar (Ctrl+C)
        try:
            for i in range(5, 0, -1):
                print(f"RESETEO TOTAL en {i} segundos... (Presiona Ctrl+C para cancelar)", end="\r")
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nReseteo cancelado por el usuario.")
            db.close()
            exit()
        
        print("\nIniciando borrado total (DROP ALL)...")
        Base.metadata.drop_all(bind=engine)
        print("... Tablas borradas.")
    # --- 👆 FIN DE LA MODIFICACIÓN ---

    # 5. Crear todas las tablas
    try:
        print("Creando tablas (CREATE ALL)...")
        # Esto creará las tablas (si se borraron) o
        # las creará si es la primera vez (si no se usó --reset)
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
            contrasena="ti123", # Asegúrate que coincida con tu schema
            rol="ti",
            activo=True
        ),
        schemas.UsuarioCreate(
            nombre="Usuario Administrador",
            email="admin@test.com",
            contrasena="admin123", # Asegúrate que coincida con tu schema
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