// src/types/user.ts

// Estructura del usuario que devuelve GET /usuarios/me
export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'estudiante' | 'profesor' | 'administrador' | 'ti';
    activo: boolean;
}

// Estructura del token que devuelve POST /token
export interface TokenData {
    access_token: string;
    token_type: string;
}

export interface ClaseCreate {
    nombre: string;
    profesor_id: number;
    fecha: string;        // Formato YYYY-MM-DD
    hora_inicio: string;  // Ej: "09:00"
    hora_fin: string;     // Ej: "10:30"
    ubicacion: string;    // Opcional, pero lo haremos requerido en el form
}

export interface Clase extends ClaseCreate {
    id: number; // El ID que devuelve el backend
}