# 📦 Sistema de Asistencia QR

Este proyecto permite **registrar y gestionar asistencia mediante códigos QR**, integrando un **backend desarrollado con FastAPI** y un **frontend en React + TypeScript**.

El sistema está diseñado para su uso en instituciones o compañías que requieran un control rápido y digitalizado de asistencia de personal o estudiantes.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:

- **Python 3.10+**
- **Node.js 18+** (incluye npm)
- **Git**
- (Opcional pero recomendado) **Virtualenv**

---

## ⚙️ Instalación del Backend (FastAPI)

1. Abre una terminal en la carpeta del backend:

   ```bash
   cd backend_qr_asistencia

2. Crea y activa un entorno virtual:

  python -m venv venv
  venv\Scripts\activate

3. Instala las dependencias necesarias:

    pip install -r requirements.txt

4. Inicia el servidor:

    uvicorn main:app --reload

    El backend se ejecutará en:
    👉 http://127.0.0.1:8000
  
  
## 💻 Instalación del Frontend (React)

1. Abre una nueva terminal y navega hasta la carpeta del frontend:

    cd frontend_qr_asistencia/frontend_qr

2. Instala las dependencias:

    npm install

3. Inicia el entorno de desarrollo:

    npm start

    El frontend se ejecutará en:
    👉 http://localhost:3000

---------------

proyecto_Qr/
│
├── backend_qr_asistencia/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── ...
│   ├── main.py
│   └── requirements.txt
│
├── frontend_qr_asistencia/
│   └── frontend_qr/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
│
└── README.md



## 🧠 Notas Importantes

-  El archivo de configuración del frontend (src/config.ts) debe contener la URL del backend.

- Asegúrate de iniciar el backend antes del frontend para evitar errores de conexión.

-------

## 👨‍💻 Guía para Desarrolladores

1. 🔸 Clonar el repositorio
    git clone https://github.com/tu-usuario Sistema-de-asistencia-QR.git
    
    cd Sistema-de-asistencia-QR

2. 🔸 Crear una nueva rama personal
    
    git checkout -b feature/mi-nueva-funcionalidad

3. 🔸 Subir cambios al repositorio

    git add .
    
    git commit -m "Descripción de los cambios realizados"
    
    git push origin feature/mi-nueva-funcionalidad

4. 🔸 Crear un Pull Request (PR)

    1. Ve a tu repositorio en GitHub.

    2. Selecciona tu rama (feature/mi-nueva-funcionalidad).

    3. Haz clic en "Compare & Pull Request".

    4. Añade una descripción clara y envíalo para revisión.