import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Container, Box, Typography, TextField, Button, 
  CircularProgress, Alert, Paper
} from '@mui/material';
import apiClient from '../services/apiClient';
import logoUni from '../assets/logo-uni.png'; 
// --- 👇 CAMBIO 1: Importar la imagen de fondo ---
import backgroundImage from '../assets/universidad-ubb.jpg'; // Asume que la guardaste en assets

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/token', new URLSearchParams({
        username: email,
        password: password
      }));
      const { access_token, refresh_token } = response.data;
      setToken(access_token, refresh_token);
      navigate('/dashboard');
    } catch (err) {
      setError("Email o contraseña incorrectos. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- 👇 CAMBIO 2: Estilos para el fondo con overlay ---
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        // Fondo de imagen
        backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.7), rgba(0, 51, 102, 0.7)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Para que la imagen no se mueva con el scroll
        backgroundRepeat: 'no-repeat',
        // --- 👆 FIN CAMBIO 2 ---
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: 3 // Borde redondeado
        }}>

          <Box
            component="img"
            src={logoUni}
            alt="Logo Universidad"
            sx={{
              width: '100%',
              maxWidth: 250, 
              height: 'auto',
              mb: 2, 
            }}
          />
          
          <Typography component="h1" variant="h5" sx={{mb: 1}}>
            Iniciar Sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Añadir estilos para el input si es necesario (opcional)
              InputLabelProps={{
                style: { color: '#022873' }, // Color de la etiqueta
              }}
              InputProps={{
                style: { color: '#000000' }, // Color del texto de entrada
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Añadir estilos para el input si es necesario (opcional)
              InputLabelProps={{
                style: { color: '#022873' },
              }}
              InputProps={{
                style: { color: '#000000' },
              }}
            />
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: '#022873', 
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#023E73', 
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
            
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;