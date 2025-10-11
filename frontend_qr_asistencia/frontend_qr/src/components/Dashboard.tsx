// src/components/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '../types/user';
import GenerarQR from './GenerarQR'; // Componente que tienes en tu carpeta
import RegistrarAsistencia from './RegistrarAsistencia'; // Componente que tienes en tu carpeta

const API_URL = 'http://localhost:8000';

interface DashboardProps {
    token: string;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Llama al endpoint GET /usuarios/me
                const response = await axios.get<User>(`${API_URL}/usuarios/me`, {
                    headers: {
                        // Autorización con el token JWT
                        Authorization: `Bearer ${token}`, 
                    },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Token inválido o expirado:', error);
                onLogout(); // Forzar el cierre de sesión si el token falla
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, onLogout]);

    if (loading) {
        return <div>Cargando perfil...</div>;
    }

    if (!userData) {
        return <div>Error al cargar el perfil.</div>;
    }

    // Lógica para renderizar la vista según el rol
    const renderContent = () => {
        switch (userData.rol) {
            case 'profesor':
                // Si es profesor, puede generar QR y gestionar clases
                return <GenerarQR token={token} profesorId={userData.id} />;
            case 'estudiante':
                // Si es estudiante, puede registrar asistencia
                return <RegistrarAsistencia token={token} alumnoId={userData.id} />;
            case 'administrador':
            case 'ti':
                return <div>Panel de {userData.rol}.</div>;
            default:
                return <div>Rol no reconocido.</div>;
        }
    };

    return (
        <div>
            <h1>Hola, {userData.nombre} ({userData.rol})</h1>
            <button onClick={onLogout}>Cerrar Sesión</button>
            <hr />
            {renderContent()}
        </div>
    );
};

export default Dashboard;