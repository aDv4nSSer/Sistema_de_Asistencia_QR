import os
import sys
from dotenv import load_dotenv, find_dotenv
import time # Para añadir un contador de seguridad

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
    from app.database import SessionLocal
    # Importamos los modelos que queremos borrar
    from app.models import Asistencia, TokenAsistencia, SesionClase
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

def clear_transactional_data():
    """
    Elimina todos los datos generados por el uso, pero conserva
    los usuarios, asignaturas y las inscripciones.
    """
    print("\n--- ¡ADVERTENCIA! ---")
    print("Estás a punto de ELIMINAR TODOS los registros de:")
    print("  1. Asistencia")
    print("  2. Tokens QR")
    print("  3. Sesiones de Clase")
    print("\nLos Usuarios y Asignaturas NO se borrarán.")
    print("Esta acción es irreversible.")
    print("-----------------------")
    
    # Un contador de seguridad para que puedas cancelar (Ctrl+C)
    try:
        for i in range(5, 0, -1):
            print(f"Comenzando borrado en {i} segundos...", end="\r")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nBorrado cancelado por el usuario.")
        db.close()
        exit()
    
    print("\nIniciando borrado...")

    try:
        # Borramos en orden inverso a las dependencias
        
        # 1. Borrar Asistencia (depende de SesionClase)
        num_asistencia = db.query(Asistencia).delete()
        print(f"  - {num_asistencia} registros de 'Asistencia' eliminados.")
        
        # 2. Borrar Tokens (depende de SesionClase)
        num_tokens = db.query(TokenAsistencia).delete()
        print(f"  - {num_tokens} 'Tokens QR' eliminados.")
        
        # 3. Borrar Sesiones de Clase (el padre)
        num_sesiones = db.query(SesionClase).delete()
        print(f"  - {num_sesiones} 'Sesiones de Clase' eliminadas.")
        
        # Confirmamos los cambios
        db.commit()
        print("\n¡Éxito! La base de datos está limpia para nuevas pruebas.")

    except Exception as e:
        print(f"\nOcurrió un error durante el borrado: {e}")
        print("Revirtiendo cambios (Rollback)...")
        db.rollback()
    finally:
        print("Cerrando sesión de base de datos.")
        db.close()

# Ejecutar el script
if __name__ == "__main__":
    clear_transactional_data()