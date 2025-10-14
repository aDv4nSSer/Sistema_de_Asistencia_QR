import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  rol: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null; // <-- AÑADIDO: para guardar el refresh token
  isAuthenticated: boolean;
  user: User | null;
  // 👇 CORRECCIÓN: La función ahora espera ambos tokens
  setToken: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Helper para decodificar el token de acceso
const decodeAccessToken = (token: string): User | null => {
  try {
    const decoded: { sub: string; rol: string } = jwtDecode(token);
    return { email: decoded.sub, rol: decoded.rol };
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null, // <-- AÑADIDO: estado inicial
  isAuthenticated: false,
  user: null,
  setToken: (accessToken: string, refreshToken: string) => {
    const user = decodeAccessToken(accessToken);
    if (user) {
      set({
        accessToken,
        refreshToken, // <-- AÑADIDO: guardamos el refresh token
        isAuthenticated: true,
        user,
      });
    }
  },
  logout: () => {
    set({
      accessToken: null,
      refreshToken: null, // <-- AÑADIDO: limpiar al salir
      isAuthenticated: false,
      user: null,
    });
  },
}));