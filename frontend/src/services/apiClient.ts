import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Creamos una instancia de Axios con la URL base de tu backend
const apiClient = axios.create({
  baseURL: 'http://192.168.1.169:8000', // Asegúrate de que coincida con tu backend
  // withCredentials no es necesario para el método Bearer token,
  // pero no hace daño tenerlo.
});

// Interceptor de Peticiones:
// Se ejecuta ANTES de que cada petición sea enviada.
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
// Se ejecuta DESPUÉS de recibir una respuesta (o un error) del backend.
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), simplemente la retornamos.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = useAuthStore.getState().refreshToken;

    // Si el error es 401 (No autorizado), hay un refresh token y no hemos reintentado ya esta petición...
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos la petición para no reintentar infinitamente

      try {
        // Hacemos la llamada al endpoint para refrescar el token
        const response = await apiClient.post('/token/refresh');
        const newAccessToken = response.data.access_token;

        // 👇 LA CORRECCIÓN ESTÁ AQUÍ
        // Pasamos el nuevo access token Y el refresh token que ya teníamos.
        useAuthStore.getState().setToken(newAccessToken, refreshToken);

        // Actualizamos la cabecera de la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Reintentamos la petición original que había fallado
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresco del token falla, cerramos la sesión del usuario.
        useAuthStore.getState().logout();
        // Redirigir al login (la mejor forma es manejar esto en un componente)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Para cualquier otro error, simplemente lo propagamos.
    return Promise.reject(error);
  }
);

export default apiClient;

