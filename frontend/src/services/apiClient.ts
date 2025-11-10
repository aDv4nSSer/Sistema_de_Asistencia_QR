import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// --- 👇 MODIFICACIÓN ---
// Ahora la baseURL es una ruta relativa.
// Vite la interceptará y la enviará a http://localhost:8000
const apiClient = axios.create({
  baseURL: '/api', 
});
// --- 👆 FIN DE LA MODIFICACIÓN ---

// Interceptor de Peticiones:
// (Sin cambios)
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token de nuestra store de Zustand
    const token = useAuthStore.getState().accessToken;
    if (token) {
      // Si hay un token, lo añadimos a la cabecera de autorización
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas:
// (Sin cambios, solo nota que la llamada de refresh ahora irá a '/api/token/refresh')
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), simplemente la retornamos.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos la petición para no reintentar infinitamente

      try {
        // Hacemos la llamada al endpoint para refrescar el token
        // Esta petición ahora se hace a '/api/token/refresh' gracias al proxy
        const response = await apiClient.post('/token/refresh'); 
        const newAccessToken = response.data.access_token;

        useAuthStore.getState().setToken(newAccessToken, refreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;