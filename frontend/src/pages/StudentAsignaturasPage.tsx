import { useState, useEffect } from 'react';
import { 
  Box, Grid, Alert, Paper,
  Card, CardContent, Typography, Stack, Button
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import SkeletonCard from '../components/SkeletonCard';
import { useAuthStore } from '../store/authStore';

// Interface para Asignatura
interface Asignatura {
  id: number;
  nombre: string;
  codigo: string | null;
  profesor: {
    nombre: string;
  } | null;
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
      return (
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}><SkeletonCard /></Grid>
          ))}
        </Grid>
      );
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
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" noWrap title={asignatura.nombre}>
                    {asignatura.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {asignatura.codigo || 'Sin código'}
                  </Typography>
                   <Typography variant="body1" sx={{mt: 1}}>
                    Profesor: {asignatura.profesor?.nombre || 'No asignado'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Bienvenido, {studentName || 'Estudiante'}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Estas son tus asignaturas inscritas.
        </Typography>
         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
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

      {renderContent()}
    </Box>
  );
};

export default StudentAsignaturasPage;