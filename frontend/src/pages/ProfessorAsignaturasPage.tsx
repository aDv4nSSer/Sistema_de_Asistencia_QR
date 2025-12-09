import { useState, useEffect } from 'react';
import { 
  Box, Modal, Grid, Alert, CircularProgress, 
  Card, CardContent, Typography, Stack, Button,
  // --- AÑADIDO: Para mostrar los horarios ---
  List, ListItem, ListItemIcon, ListItemText, Chip
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import HistoryIcon from '@mui/icons-material/History';
// --- AÑADIDO: Icono de reloj ---
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import ProfessorWelcomeCard from '../components/professor/ProfessorWelcomeCard';

// --- AÑADIDO: Interfaz de Horario ---
enum DiaSemana {
  lunes = "Lunes",
  martes = "Martes",
  miercoles = "Miércoles",
  jueves = "Jueves",
  viernes = "Viernes",
  sabado = "Sábado",
  domingo = "Domingo",
}

interface Horario {
  id: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
}
// --- FIN DE LA MODIFICACIÓN ---

// Interface para Asignatura
interface Asignatura {
  id: number; 
  nombre: string; 
  codigo: string;
  horarios: Horario[]; // <-- AÑADIDO
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
      // --- MODIFICACIÓN: Lógica de Iniciar Sesión ---
      // 1. Llamamos a "iniciar-sesion". El backend valida el horario.
      // Ya no enviamos un body, el backend lo deduce todo.
      const sesionResponse = await apiClient.post<SesionClase>(
        `/asignaturas/${asignaturaId}/iniciar-sesion`
      );
      const newSesionId = sesionResponse.data.id;

      // 2. Generar el QR para esa sesión (esto no cambia)
      const qrResponse = await apiClient.post(`/qr/generate/${newSesionId}`, {}, {
        responseType: 'blob'
      });
      
      setQrCodeUrl(URL.createObjectURL(qrResponse.data));

    } catch (error: any) {
      console.error("Error generando el QR:", error);
      // El manejo de errores ahora es más simple
      let errorMsg = "Error desconocido al iniciar la sesión.";
      if (error.response && error.response.data && error.response.data.detail) {
        // Capturamos el error del backend (ej: "No hay clase programada...")
        errorMsg = error.response.data.detail;
      }
      setQrError(errorMsg);
    } finally {
      setQrLoading(false);
    }
    // --- FIN DE LA MODIFICACIÓN ---
  };
  
  const handleCloseQrModal = () => setQrModalOpen(false);

  const renderContent = () => {
    if (loading) {
      // ... (no cambia)
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
                
                {/* --- MODIFICACIÓN: Mostrar Horarios --- */}
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" noWrap title={asignatura.nombre}>
                    {asignatura.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {asignatura.codigo || 'Sin código'}
                  </Typography>

                  {/* Lista de Horarios */}
                  {asignatura.horarios.length > 0 ? (
                    <List dense sx={{ pt: 1 }}>
                      {asignatura.horarios.map((h) => (
                        <ListItem key={h.id} sx={{ p: 0 }}>
                          <ListItemIcon sx={{ minWidth: '32px' }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${h.dia_semana}`} 
                            secondary={`${h.hora_inicio} - ${h.hora_fin}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Chip label="Sin horario asignado" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <Stack 
                  direction="column" 
                  spacing={1} 
                  sx={{ width: '100%', mt: 'auto' }} 
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
      <ProfessorWelcomeCard />

      <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
        Mis Asignaturas
      </Typography>

      {renderContent()}

      {/* --- MODIFICACIÓN: Modal de QR con mejor error --- */}
      <Modal open={qrModalOpen} onClose={handleCloseQrModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper', boxShadow: 24, p: 4, textAlign: 'center', borderRadius: 2
        }}>
          {qrLoading && <CircularProgress />}
          
          {/* El error ahora muestra el mensaje del backend */}
          {qrError && (
            <Box>
              <Typography variant="h6" color="error">Error al iniciar sesión</Typography>
              <Alert severity="error" sx={{ mt: 2 }}>{qrError}</Alert>
              <Button onClick={handleCloseQrModal} sx={{ mt: 2 }}>Cerrar</Button>
            </Box>
          )}

          {qrCodeUrl && !qrLoading && (
            <>
              <img src={qrCodeUrl} alt={`QR para la sesión`} style={{ maxWidth: '100%' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>Escanea este QR</Typography>
            </>
          )}
        </Box>
      </Modal>
      {/* --- FIN DE LA MODIFICACIÓN --- */}
    </Box>
  );
};

export default ProfessorAsignaturasPage;
