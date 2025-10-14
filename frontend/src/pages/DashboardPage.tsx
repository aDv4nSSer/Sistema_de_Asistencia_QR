import { useAuthStore } from '../store/authStore';
import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Panel Principal
        </Typography>
        {user && (
          <>
            <Typography variant="h6">Bienvenido, {user.email}</Typography>
            <Typography>Tu rol es: <strong>{user.rol}</strong></Typography>
          </>
        )}
        <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
          Cerrar Sesión
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;