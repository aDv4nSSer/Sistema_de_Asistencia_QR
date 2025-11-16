import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Esta página ya no es un "dashboard", sino un "router" inteligente.
 * Redirige al usuario a la página principal de su rol.
 */
const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Lógica de redirección basada en el rol del usuario
    switch (user.rol) {
      case 'estudiante':
        navigate('/estudiante/asignaturas', { replace: true });
        break;
      case 'profesor':
        navigate('/profesor/asignaturas', { replace: true });
        break;
      case 'administrador':
      case 'ti':
        navigate('/admin/gestion', { replace: true });
        break;
      default:
        // Por si acaso, lo enviamos al login si el rol no es válido
        navigate('/login', { replace: true });
    }
    
    // El { replace: true } es importante: evita que el usuario
    // pueda presionar "Atrás" y volver a esta página de carga.

  }, [user, navigate]); // Se ejecuta en cuanto se carga el usuario

  // Muestra un indicador de carga mientras se procesa la redirección
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '60vh' 
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Redirigiendo...</Typography>
    </Box>
  );
};

export default DashboardPage;