// src/pages/StudentScannerPage.tsx
import { useState } from 'react';
import {
  Typography, Box, TextField, Button,
  CircularProgress, Alert, Paper
} from '@mui/material';
import QrScanner from '../components/QrScanner'; 
import apiClient from '../services/apiClient';

const StudentScannerPage = () => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegisterAttendance = async (token: string) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await apiClient.post(
            '/qr/register-attendance',
            { 
              qr_token: token,
              lat: latitude,
              lng: longitude
            }
          );
          setSuccess(response.data.message || 'Asistencia registrada con éxito.');
          setManualToken(''); 
        
        } catch (err: any) {
          const errorMsg = err.response?.data?.detail || 'Error al registrar la asistencia.';
          setError(errorMsg);
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.error("Error de geolocalización:", geoError);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Acceso a la ubicación denegado. Debes permitirlo para registrar tu asistencia.");
        } else {
          setError("No se pudo obtener tu ubicación. Inténtalo de nuevo.");
        }
        setLoading(false);
      }
    );
  };

  return (
    <Box sx={{
      maxWidth: 'sm', // Limita el ancho máximo
      mx: 'auto'      // Centra horizontalmente
    }}>

      <Typography variant="h4" gutterBottom>
        Registrar Asistencia
      </Typography>

      {/* 1. El Scanner Visual */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Escanear QR
        </Typography>
        <QrScanner onScanSuccess={handleRegisterAttendance} />
      </Paper>

      {/* 2. El "Modo Desarrollador" para pegar el token */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Registro Manual (Modo Dev)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Si no tienes cámara, pega el token del QR aquí para probar.
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegisterAttendance(manualToken);
          }}
          sx={{ mt: 2 }}
        >
          <TextField
            label="Pegar Token del QR"
            fullWidth
            multiline
            rows={3}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !manualToken}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Manualmente'}
          </Button>
        </Box>
      </Paper>

      {/* 3. Mensajes de Estado */}
      <Box sx={{ mt: 3, width: '100%' }}>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
      
    </Box>
  );
};

export default StudentScannerPage;