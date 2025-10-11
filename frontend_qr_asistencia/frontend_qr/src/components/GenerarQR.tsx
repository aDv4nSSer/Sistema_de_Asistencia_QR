// src/components/GenerarQR.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { ClaseCreate, Clase } from '../types/user';
import { API_URL } from '../config'; // Usamos la constante centralizada
// Necesitas la librería dayjs para manejar formatos de fecha
// npm install dayjs
import dayjs from 'dayjs'; 

interface GenerarQRProps {
    token: string;
    profesorId: number; 
}

// Valores iniciales del formulario
const initialClaseState: ClaseCreate = {
    nombre: '',
    profesor_id: 0, // Se actualizará con las props
    fecha: dayjs().format('YYYY-MM-DD'), 
    hora_inicio: '09:00',
    hora_fin: '10:30',
    ubicacion: '',
};

const GenerarQR: React.FC<GenerarQRProps> = ({ token, profesorId }) => {
    const [claseData, setClaseData] = useState<ClaseCreate>({ 
        ...initialClaseState,
        profesor_id: profesorId 
    });
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [claseCreada, setClaseCreada] = useState<Clase | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClaseData({ ...claseData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Creando clase y generando QR...');
        setQrImage(null);

        try {
            // ===================================
            // PASO 1: CREAR LA CLASE (POST /clases/)
            // ===================================
            const claseResponse = await axios.post<Clase>(
                `${API_URL}/clases/`, // Suponiendo que tienes un router para clases
                claseData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const nuevaClase = claseResponse.data;
            setClaseCreada(nuevaClase);
            
            // Generar un hash simple (para esta versión, el hash puede ser el ID de la clase)
            // En una versión final, deberías generar un UUID robusto aquí.
            const qrHash = `CLASE_${nuevaClase.id}_${new Date().getTime()}`;

            // ===================================
            // PASO 2: REGISTRAR EL HASH QR (POST /qr/qrcodes)
            // ===================================
            const now = dayjs();
            const qrPayload = {
                clase_id: nuevaClase.id,
                qr_hash: qrHash,
                fecha_creacion: now.toISOString(),
                // El QR expira 30 minutos después de su creación
                fecha_expiracion: now.add(30, 'minute').toISOString(),
                ubicacion_permitida: nuevaClase.ubicacion, 
            };

            await axios.post(
                `${API_URL}/qr/qrcodes`,
                qrPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // ===================================
            // PASO 3: OBTENER LA IMAGEN QR (POST /qr/generate_qr_img/)
            // ===================================
            const imgResponse = await axios.post(
                `${API_URL}/qr/generate_qr_img/`,
                qrPayload, // Reutilizamos el mismo payload de metadata
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'arraybuffer' // Petición binaria para la imagen
                }
            );
            
            // Convertir la respuesta binaria a URL de imagen
            const blob = new Blob([imgResponse.data], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(blob);
            
            setQrImage(imageUrl);
            setMessage(`✅ QR generado para la clase: ${nuevaClase.nombre}`);

        } catch (error: any) {
            console.error(error);

            let errorMessage = 'Error desconocido al registrar.';
            
            // Si es un error de respuesta del servidor (código 4xx/5xx)
            if (error.response && error.response.data) {
                const responseData = error.response.data;

                // 1. Manejo de error 422 (Validación de Pydantic)
                if (error.response.status === 422 && Array.isArray(responseData.detail)) {
                    // Muestra el primer error de validación de Pydantic
                    const firstError = responseData.detail[0];
                    errorMessage = `Error de validación: El campo '${firstError.loc[1]}' es inválido. ${firstError.msg}`;
                
                // 2. Manejo de otros errores del servidor (ej: 403 Forbidden)
                } else if (responseData.detail) {
                    errorMessage = `Error: ${responseData.detail}`;
                
                // 3. Error genérico
                } else {
                    errorMessage = `Error HTTP ${error.response.status}: Revise la consola.`;
                }
            }
            
            setMessage(`❌ ${errorMessage}`);
        }
    };


    return (
        <div>
            <h3>Panel de Profesor - Generar QR</h3>
            <p>Profesor ID: {profesorId}</p>
            <hr />

            {!qrImage && (
                <form onSubmit={handleSubmit}>
                    <h4>Crear Nueva Clase</h4>
                    <div><input name="nombre" value={claseData.nombre} onChange={handleChange} placeholder="Nombre de la Clase (ej: Cálculo I)" required /></div>
                    <div><input type="date" name="fecha" value={claseData.fecha} onChange={handleChange} required /></div>
                    <div><input type="time" name="hora_inicio" value={claseData.hora_inicio} onChange={handleChange} required /></div>
                    <div><input type="time" name="hora_fin" value={claseData.hora_fin} onChange={handleChange} required /></div>
                    <div><input name="ubicacion" value={claseData.ubicacion} onChange={handleChange} placeholder="Ubicación (ej: Sala 301)" required /></div>
                    <button type="submit" disabled={message.includes('Creando')}>Generar QR de Asistencia</button>
                </form>
            )}

            <p>Estado: {message}</p>

            {qrImage && (
                <div>
                    <h4>Código QR Activo</h4>
                    <p>Clase: {claseCreada?.nombre} (ID: {claseCreada?.id})</p>
                    <img src={qrImage} alt="Código QR de Asistencia" style={{ width: '250px', height: '250px' }} />
                    <br />
                    <button onClick={() => { setQrImage(null); setMessage(''); setClaseData({...initialClaseState, profesor_id: profesorId}) }}>
                        Finalizar Clase y Generar Nuevo
                    </button>
                </div>
            )}
        </div>
    );
};

export default GenerarQR;