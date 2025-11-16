import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Alert, List, ListItemButton, 
  ListItemText, Paper, Skeleton, Stack, Divider
} from '@mui/material';
import ProfessorReportDetail from '../components/professor/ProfessorReportDetail'; 
import ProfessorSessionList from '../components/professor/ProfessorSessionList';
import apiClient from '../services/apiClient';

// --- 👇 AÑADIDO: Importamos la tarjeta de bienvenida ---
import ProfessorWelcomeCard from '../components/professor/ProfessorWelcomeCard';

interface Asignatura {
  id: number; 
  nombre: string; 
  codigo: string | null;
}

const ProfessorHistoryPage = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<number | null>(null);

  useEffect(() => {
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
    fetchAsignaturas();
  }, []);

  const renderAsignaturaList = () => {
    if (loading) {
      return (
        <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (asignaturas.length === 0) {
      return <Alert severity="info">No tienes asignaturas para revisar el historial.</Alert>;
    }
    return (
      <Paper>
        <List component="nav" sx={{ p: 0 }}>
          {asignaturas.map((asignatura) => (
            <ListItemButton
              key={asignatura.id}
              selected={selectedAsignaturaId === asignatura.id}
              onClick={() => setSelectedAsignaturaId(asignatura.id)}
            >
              <ListItemText 
                primary={asignatura.nombre} 
                secondary={asignatura.codigo || 'Sin código'} 
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      {/* --- 👇 AÑADIDO: Tarjeta de Bienvenida --- */}
      <ProfessorWelcomeCard />
      {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Seleccionar Asignatura
          </Typography>
          {renderAsignaturaList()}
        </Grid>

        <Grid item xs={12} md={8}>
          {!selectedAsignaturaId ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Selecciona una asignatura para ver el reporte y el historial de sesiones.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {/* 1. Componente de Reporte (%) */}
              <ProfessorReportDetail asignaturaId={selectedAsignaturaId} />
              <Divider />
              {/* 2. Componente de Lista de Sesiones */}
              <ProfessorSessionList asignaturaId={selectedAsignaturaId} />
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfessorHistoryPage;