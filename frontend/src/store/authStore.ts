import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  rol: string;
  id: number;
  nombre: string; // <-- 1. AÑADE LA PROPIEDAD 'nombre'
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null; 
  isAuthenticated: boolean;
  user: User | null;
  setToken: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Helper para decodificar el token de acceso
const decodeAccessToken = (token: string): User | null => {
  try {
    // 2. ACTUALIZA LA DECODIFICACIÓN
    const decoded: { sub: string; rol: string; id: number; nombre: string } = jwtDecode(token);
    return { email: decoded.sub, rol: decoded.rol, id: decoded.id, nombre: decoded.nombre };
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null, 
  isAuthenticated: false,
  user: null,
  setToken: (accessToken: string, refreshToken: string) => {
    const user = decodeAccessToken(accessToken);
    if (user) {
      set({
        accessToken,
        refreshToken, 
        isAuthenticated: true,
        user,
      });
    }
  },
  logout: () => {
    set({
      accessToken: null,
      refreshToken: null, 
      isAuthenticated: false,
      user: null,
    });
  },
}));