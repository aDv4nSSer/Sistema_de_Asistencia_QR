import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const UnauthorizedPage = () => {
  return (
    <Container>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="h6" color="text.secondary">
          No tienes los permisos necesarios para ver esta página.
        </Typography>
        <Button component={Link} to="/dashboard" variant="contained" sx={{ mt: 4 }}>
          Volver al Panel Principal
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;