import { useState, useEffect } from 'react';
import { 
  Box, Grid, Alert, Paper,
  Card, CardContent, Typography, Stack, Button,
  // --- 👇 AÑADIDO: Para mostrar los horarios ---
  List, ListItem, ListItemIcon, ListItemText, Chip
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
// --- 👇 AÑADIDO: Icono de reloj ---
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

// --- 👇 AÑADIDO: Interfaz de Horario ---
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
// --- 👆 FIN DE LA MODIFICACIÓN ---

// Interface para Asignatura
interface Asignatura {
  id: number;
  nombre: string;
  codigo: string | null;
  profesor: {
    nombre: string;
  } | null;
  horarios: Horario[]; // <-- AÑADIDO
}

const StudentAsignaturasPage = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const studentName = useAuthStore((state) => state.user?.nombre);

  const fetchAsignaturas = async () => {
    try {
      setLoading(true); setError(null);
      const response = await apiClient.get('/asignaturas/mis-asignaturas-inscritas');
      setAsignaturas(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar tus asignaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAsignaturas(); }, []); 

  const renderContent = () => {
    if (loading) {
      // ... (no cambia)
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (asignaturas.length === 0) {
      return <Alert severity="info">No estás inscrito/a en ninguna asignatura por el momento.</Alert>;
    }
    return (
      <Grid container spacing={3}>
        {asignaturas.map((asignatura) => (
          <Grid item xs={12} md={6} lg={4} key={asignatura.id}>
            <Card sx={{ height: '100%' }}>
              {/* --- 👇 MODIFICACIÓN: Mostrar Horarios --- */}
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" noWrap title={asignatura.nombre}>
                    {asignatura.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {asignatura.codigo || 'Sin código'}
                  </Typography>
                  <Typography variant="body1" sx={{mt: 1, mb: 1}}>
                    Profesor: {asignatura.profesor?.nombre || 'No asignado'}
                  </Typography>

                  {/* Lista de Horarios */}
                  {asignatura.horarios.length > 0 ? (
                    <List dense sx={{ pt: 0 }}>
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
                    <Chip label="Sin horario asignado" size="small" />
                  )}
                </Box>
              </CardContent>
              {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Tarjeta de bienvenida (no cambia) */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          alignItems="center"
          sx={{ mb: 3 }} 
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <HomeIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" gutterBottom>
              Bienvenido, {studentName || 'Estudiante'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Aquí puedes escanear tu asistencia, ver tu historial y revisar
              las asignaturas que tienes inscritas.
            </Typography>
          </Box>
        </Stack>
         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button 
            variant="contained" 
            startIcon={<CameraAltIcon />}
            onClick={() => navigate('/estudiante/asistencia')}
            sx={{ flex: 1 }} 
          >
            Escanear QR
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/estudiante/historial')}
            sx={{ flex: 1 }} 
          >
            Ver Mi Historial
          </Button>
        </Stack>
      </Paper>

      {/* Título y contenido (no cambian) */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Mis Asignaturas
      </Typography>
      {renderContent()}
    </Box>
  );
};

export default StudentAsignaturasPage;