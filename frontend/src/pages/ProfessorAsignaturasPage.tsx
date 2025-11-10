import { useState, useEffect } from 'react';
import { 
  Box, Modal, Grid, Alert, CircularProgress, 
  Card, CardContent, Typography, Stack, Button
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import SkeletonCard from '../components/SkeletonCard';
import ProfessorWelcomeCard from '../components/professor/ProfessorWelcomeCard';

// Interface para Asignatura
interface Asignatura {
  id: number; 
  nombre: string; 
  codigo: string;
}

// Interface para la Sesion (devuelta por el backend)
interface SesionClase {
  id: number;
  asignatura_id: number;
  fecha: string;
}

const ProfessorAsignaturasPage = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estados para Modal de QR
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const fetchAsignaturas = async () => {
    try {
      setLoading(true); setError(null);
      const response = await apiClient.get('/asignaturas/mis-asignaturas');
      setAsignaturas(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las asignaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAsignaturas(); }, []); 

  const handleGenerateQr = async (asignaturaId: number) => {
    setQrModalOpen(true);
    setQrLoading(true);
    setQrCodeUrl(null);
    setQrError(null);

    try {
      // --- 👇 CORRECCIÓN 1: Enviar el 'asignatura_id' en el body ---
      // El backend lo espera para la validación de Pydantic.
      const sesionResponse = await apiClient.post<SesionClase>(
        `/asignaturas/${asignaturaId}/iniciar-sesion`, 
        { asignatura_id: asignaturaId } // <-- ESTE ES EL ARREGLO DEL 422
      );
      const newSesionId = sesionResponse.data.id;

      // 2. Generar el QR para esa sesión
      const qrResponse = await apiClient.post(`/qr/generate/${newSesionId}`, {}, {
        responseType: 'blob'
      });
      
      setQrCodeUrl(URL.createObjectURL(qrResponse.data));

    // --- 👇 CORRECCIÓN 2: Mejorar el manejo de errores ---
    } catch (error: any) {
      console.error("Error generando el QR:", error);

      // Usamos una IIFE asíncrona para poder usar 'await' y decodificar blobs
      (async () => {
        let errorMsg = "Error al iniciar la sesión o generar el QR.";
        
        if (error.response && error.response.data) {
          // Caso A: El error es un Blob (suele pasar en el 2do request)
          if (error.response.data instanceof Blob) {
            try {
              const errorText = await error.response.data.text();
              const errorJson = JSON.parse(errorText);
              errorMsg = errorJson.detail || errorMsg; // Extrae el 'detail' del JSON
            } catch (e) {
              errorMsg = "Error al decodificar la respuesta de error.";
            }
          } 
          // Caso B: El error es JSON (suele pasar en el 1er request)
          else if (error.response.data.detail) {
            const detail = error.response.data.detail;
            
            // Si 'detail' es un string (ej: "No encontrado")
            if (typeof detail === 'string') {
              errorMsg = detail;
            } 
            // Si 'detail' es un array (error de validación 422)
            else if (Array.isArray(detail) && detail.length > 0) {
              // Muestra el primer mensaje de error
              errorMsg = detail[0].msg || "Error de validación de datos.";
            }
          }
        }
        setQrError(errorMsg); // Actualiza el estado con un string legible
      })();
    // --- 👆 FIN DE LA CORRECCIÓN 2 ---

    } finally {
      setQrLoading(false);
    }
  };
  
  const handleCloseQrModal = () => setQrModalOpen(false);

  const renderContent = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}><SkeletonCard /></Grid>
          ))}
        </Grid>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (asignaturas.length === 0) {
      return <Alert severity="info">No tienes asignaturas registradas por TI.</Alert>;
    }
    return (
      <Grid container spacing={3}>
        {asignaturas.map((asignatura) => (
          <Grid item xs={12} sm={6} md={4} key={asignatura.id}> 
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" noWrap title={asignatura.nombre}>
                    {asignatura.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {asignatura.codigo || 'Sin código'}
                  </Typography>
                </Box>
                {/* Stack de botones */}
                <Stack 
                  direction="column" // Botones uno encima del otro
                  spacing={1} 
                  sx={{ width: '100%', mt: 'auto' }} // mt: 'auto' empuja al fondo
                >
                  <Button 
                    variant="contained" 
                    startIcon={<QrCode2Icon />}
                    onClick={() => handleGenerateQr(asignatura.id)}
                  >
                    Tomar Asistencia (QR)
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate(`/profesor/historial`)} 
                  >
                    Historial
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <ProfessorWelcomeCard />
        {renderContent()}
      </Box>

      <Modal open={qrModalOpen} onClose={handleCloseQrModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper', boxShadow: 24, p: 4, textAlign: 'center', borderRadius: 2
        }}>
          {qrLoading && <CircularProgress />}
          {/* 'qrError' ahora siempre será un string legible,
            por lo que React podrá renderizarlo sin problemas.
          */}
          {qrError && <Alert severity="error">{qrError}</Alert>}
          {qrCodeUrl && !qrLoading && (
            <img src={qrCodeUrl} alt={`QR para la sesión`} style={{ maxWidth: '100%' }} />
          )}
          <Typography variant="h6" sx={{ mt: 2 }}>Escanea este QR</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfessorAsignaturasPage;