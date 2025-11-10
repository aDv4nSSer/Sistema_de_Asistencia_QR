import { useAuthStore } from '../store/authStore';
import { Button, Typography, Paper, Box } from '@mui/material'; // Importa Box
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Opcional: Envuelve la página en un Box para centrarla verticalmente también
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', // Centra horizontalmente el Paper
        pt: 4 // Añade un poco de padding superior
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: 3, 
          // --- 👇 TUS CAMBIOS + CENTRADO ---
          width: '100%',     // Que ocupe el 100% de su contenedor padre
          maxWidth: 600,     // Pero solo hasta un máximo de 600px
          textAlign: 'center', // Centra el texto dentro de la caja
          mx: 'auto',          // Centra la caja (esto es lo que pediste)
          // --- 👆 FIN DE LOS CAMBIOS ---
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Panel Principal
        </Typography>
        {user && (
          <>
            <Typography variant="h6">Bienvenido, {user.nombre || user.email}</Typography>
            <Typography>Tu rol es: <strong>{user.rol}</strong></Typography>
          </>
        )}
        <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
          Cerrar Sesión
        </Button>
      </Paper>
    </Box>
  );
};

export default DashboardPage;