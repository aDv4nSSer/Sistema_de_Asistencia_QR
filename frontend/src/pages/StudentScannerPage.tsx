import { useState } from 'react';
import {
  Typography, Box, TextField, Button,
  CircularProgress, Paper, Stack
} from '@mui/material';
// --- AÑADIDO: Importar iconos ---
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReplayIcon from '@mui/icons-material/Replay';
// ---  FIN DE LA MODIFICACIÓN ---

import QrScanner from '../components/QrScanner'; 
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

const StudentScannerPage = () => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ---  AÑADIDO: Estado para controlar el escáner ---
  const [isScanning, setIsScanning] = useState(true);
  // ---  FIN DE LA MODIFICACIÓN ---

  const studentName = useAuthStore((state) => state.user?.nombre);

  const handleRegisterAttendance = async (token: string) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setLoading(false);
      // --- AÑADIDO: Detener escaneo ---
      setIsScanning(false);
      // ---  FIN DE LA MODIFICACIÓN ---
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
          // ---  AÑADIDO: Detener escaneo (en éxito o error) ---
          setIsScanning(false);
          // ---  FIN DE LA MODIFICACIÓN ---
        }
      },
      (geoError) => {
        console.error("Error de geolocalización:", geoError);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Acceso a la ubicación denegado. Debes permitirlo.");
        } else {
          setError("No se pudo obtener tu ubicación. Inténtalo de nuevo.");
        }
        setLoading(false);
        // ---  AÑADIDO: Detener escaneo ---
        setIsScanning(false);
        // ---  FIN DE LA MODIFICACIÓN ---
      }
    );
  };

  // ---  AÑADIDO: Función para volver a escanear ---
  const handleScanAgain = () => {
    setIsScanning(true);
    setSuccess(null);
    setError(null);
  };
  // ---  FIN DE LA MODIFICACIÓN ---

  // ---  AÑADIDO: Componentes visuales para los estados ---
  const renderScanner = () => (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hola {studentName || 'Estudiante'}. Apunta tu cámara al código QR.
      </Typography>
      <QrScanner onScanSuccess={handleRegisterAttendance} />
    </>
  );

  const renderLoading = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Registrando asistencia...</Typography>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, textAlign: 'center' }}>
      <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
      <Typography variant="h6" sx={{ mt: 2 }}>¡Listo!</Typography>
      <Typography>{success}</Typography>
      {/* Podríamos añadir un botón para volver al dashboard */}
    </Box>
  );

  const renderError = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, textAlign: 'center' }}>
      <ErrorIcon color="error" sx={{ fontSize: 60 }} />
      <Typography variant="h6" sx={{ mt: 2 }}>Error</Typography>
      <Typography>{error}</Typography>
      <Button
        variant="contained"
        startIcon={<ReplayIcon />}
        onClick={handleScanAgain}
        sx={{ mt: 2 }}
      >
        Escanear de Nuevo
      </Button>
    </Box>
  );
  // ---  FIN DE LA MODIFICACIÓN ---


  return (
    <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <QrCodeScannerIcon color="primary" />
          <Typography variant="h5">
            Registrar Asistencia
          </Typography>
        </Stack>
        
        {/* --- MODIFICADO: Renderizado Condicional --- */}
        {loading && renderLoading()}
        {!loading && success && renderSuccess()}
        {!loading && error && renderError()}
        {!loading && !success && !error && isScanning && renderScanner()}
        {/* --- FIN DE LA MODIFICACIÓN --- */}
      </Paper>
      
      {/* Modo Dev (no cambia) */}
      {import.meta.env.MODE === 'development' && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            border: '2px dashed', 
            borderColor: 'divider', 
            bgcolor: 'action.hover' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Registro Manual (Modo Dev)
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
      )}
    </Box>
  );
};

export default StudentScannerPage;
