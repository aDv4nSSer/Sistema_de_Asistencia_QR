// src/components/admin/AdminReportPanel.tsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Alert, List, ListItemButton, 
  ListItemText, Paper, Skeleton
} from '@mui/material';
// Importamos el componente de detalle que ya creamos para el profesor. ¡Reutilizamos!
import ProfessorReportDetail from '../professor/ProfessorReportDetail'; 
import apiClient from '../../services/apiClient';

// Interface de Asignatura
interface Asignatura {
  id: number; 
  nombre: string; 
  codigo: string | null;
  profesor: {
      nombre: string;
  } | null;
}

const AdminReportPanel = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllAsignaturas = async () => {
      try {
        setLoading(true); setError(null);
        // --- ESTA ES LA ÚNICA DIFERENCIA ---
        // El admin obtiene TODAS las asignaturas
        const response = await apiClient.get('/asignaturas/');
        setAsignaturas(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'No se pudieron cargar las asignaturas.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllAsignaturas();
  }, []);

  const renderAsignaturaList = () => {
    if (loading) {
      return (
        <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (asignaturas.length === 0) {
      return <Alert severity="info">No hay asignaturas creadas en el sistema.</Alert>;
    }
    return (
      <Paper>
        <List component="nav" sx={{ p: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          {asignaturas.map((asignatura) => (
            <ListItemButton
              key={asignatura.id}
              selected={selectedAsignaturaId === asignatura.id}
              onClick={() => setSelectedAsignaturaId(asignatura.id)}
            >
              <ListItemText 
                primary={asignatura.nombre} 
                secondary={asignatura.profesor?.nombre || 'Sin profesor'} 
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Seleccionar Asignatura
          </Typography>
          {renderAsignaturaList()}
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Reutilizamos el componente de detalle del profesor */}
          <ProfessorReportDetail asignaturaId={selectedAsignaturaId} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminReportPanel;