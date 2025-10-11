// src/components/RegistrarAsistencia.tsx

import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs'; 
import { QrReader } from 'react-qr-reader';
import { API_URL } from '../config'; 

// Definiciones de tipos (Asegúrate de que estas también están en tu archivo 'user.ts' o similar)
interface QrCodeData { 
    clase_id: number; 
    qr_hash: string; 
    fecha_expiracion: string; 
    ubicacion_permitida: string;
}

// Nota: La interfaz AsistenciaRequest en el FE solo debe tener los campos que el backend necesita *en el cuerpo* de la petición.
interface AsistenciaRequest { 
    clase_id: number; 
    timestamp: string; 
    estado: 'presente' | 'tarde' | 'ausente'; 
    token_qr: string; 
}

interface RegistrarAsistenciaProps {
    token: string;
    alumnoId: number; 
}

const RegistrarAsistencia: React.FC<RegistrarAsistenciaProps> = ({ token, alumnoId }) => {
    // ESTADOS
    const [qrData, setQrData] = useState<QrCodeData | null>(null);
    const [message, setMessage] = useState('Escaneando QR...');
    const [isScanning, setIsScanning] = useState(true);
    const [error, setError] = useState<string | null>(null); 

    // FUNCIÓN PRINCIPAL DE REGISTRO
    const handleRegister = async (dataFromQr: QrCodeData) => {
        setMessage('Registrando asistencia...');
        setIsScanning(false);
        setError(null);
        
        try {
            // 1. Crear el payload de asistencia
            const now = dayjs().toISOString();
            const asistenciaPayload: AsistenciaRequest = {
                clase_id: dataFromQr.clase_id,
                // alumno_id se omite: el backend lo obtiene del token
                timestamp: now,
                estado: 'presente', 
                token_qr: dataFromQr.qr_hash,
            };

            // 2. POST /qr/register_attendance/
            const response = await axios.post(
                `${API_URL}/qr/register_attendance/`,
                asistenciaPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(`✅ ${response.data.message || 'Asistencia registrada exitosamente'}`);

        } catch (error: any) {
            console.error('Error al registrar asistencia:', error);
            const detail = error.response?.data?.detail || error.message || 'Error desconocido del servidor.';
            setMessage(`❌ Falló el registro: ${typeof detail === 'string' ? detail : 'Error de validación o expiración.'}`);
            setError(detail);
        }
    };
    
    // FUNCIÓN CALLBACK DEL ESCÁNER (Se ejecuta al detectar un QR)
    const handleScanResult = (result: any, error: any) => {
        if (!!result && isScanning) {
            const decodedText = result?.text;
            if (!decodedText) return;

            // Aseguramos que solo procese una vez
            setIsScanning(false);

            try {
                // 1. Decodificar el JSON del QR
                const parsedData: QrCodeData = JSON.parse(decodedText);
                
                // 2. Verificar que sea un objeto de QR válido
                if (parsedData.clase_id && parsedData.qr_hash) {
                    setQrData(parsedData); 
                    handleRegister(parsedData); // Intentamos el registro inmediato
                } else {
                    setMessage("QR inválido: No contiene los campos requeridos.");
                    setIsScanning(true); // Reinicia escaneo para reintentar
                }
            } catch (e) {
                setMessage("Error al decodificar el QR. Asegúrese de que sea un JSON válido.");
                setIsScanning(true); // Reinicia escaneo
            }
        }

        if (!!error && isScanning) {
             // Puedes manejar el error de la cámara aquí, si es necesario
             // console.warn('Error en escáner:', error);
        }
    };

    // FUNCIÓN PARA REINICIAR ESCÁNER
    const restartScan = () => {
        setQrData(null);
        setMessage('Escaneando QR...');
        setError(null);
        setIsScanning(true);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h3>Panel de Estudiante - Registrar Asistencia</h3>
            <p>Alumno ID: {alumnoId}</p>
            <hr />
            
            {/* -------------------- MÓDULO DE ESCANEO -------------------- */}
            {isScanning && (
                <div>
                    <QrReader
                        onResult={handleScanResult}
                        constraints={{
                            facingMode: 'environment', // Usa cámara trasera por defecto
                        }}
                        // El estilo asegura que el componente sea visible y no se desborde
                        containerStyle={{ width: '100%', height: 'auto' }} 
                        videoStyle={{ width: '100%' }}
                    />
                    <p style={{ color: 'blue', textAlign: 'center' }}>{message}</p>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <p style={{ textAlign: 'center' }}>Apunte la cámara al Código QR del Profesor.</p>
                </div>
            )}
            
            {/* -------------------- RESULTADO DEL REGISTRO -------------------- */}
            {!isScanning && (
                <div>
                    {qrData && (
                        <>
                            <h4>Registro Finalizado</h4>
                            <p><strong>Clase ID:</strong> {qrData.clase_id}</p>
                            <p><strong>Token QR:</strong> {qrData.qr_hash.substring(0, 20)}...</p>
                            <p style={{ marginTop: '20px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>
                                Estado Final: {message}
                            </p>
                        </>
                    )}
                    {!qrData && <p style={{ fontWeight: 'bold', color: 'red' }}>{message}</p>}
                    
                    <button 
                        onClick={restartScan}
                        style={{ 
                            marginTop: '20px', 
                            padding: '10px 20px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Escanear Otro QR
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegistrarAsistencia;