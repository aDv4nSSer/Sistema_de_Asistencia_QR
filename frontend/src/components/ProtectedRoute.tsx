import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// --- INICIO DE LA MODIFICACIÓN ---
// Añadimos 'ti' a la lista de roles permitidos
interface ProtectedRouteProps {
  allowedRoles?: ('profesor' | 'estudiante' | 'administrador' | 'ti')[];
}
// --- FIN DE LA MODIFICACIÓN ---

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. ¿Está el usuario autenticado?
  if (!isAuthenticated) {
    // Si no, redirigir a la página de login.
    return <Navigate to="/login" replace />;
  }

  // 2. ¿La ruta requiere roles específicos y el usuario tiene el rol permitido?
  const isAuthorized = !allowedRoles || allowedRoles.includes(user!.rol as any);

  if (!isAuthorized) {
    // Si el usuario está logueado pero no tiene el rol, redirigir a una página de "No autorizado".
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Si todo está en orden, mostrar la página solicitada.
  return <Outlet />;
};

export default ProtectedRoute;