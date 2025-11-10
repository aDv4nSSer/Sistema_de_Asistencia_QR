import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface SesionClase {
  id: number;
  fecha: string;
  hora_inicio: string | null;
  ubicacion: string | null;
}

interface Props {
  asignaturaId: number | null;
}

const ProfessorSessionList = ({ asignaturaId }: Props) => {
  const [sesiones, setSesiones] = useState<SesionClase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!asignaturaId) {
      setSesiones([]);
      return;
    }

    const fetchSesiones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/asignaturas/${asignaturaId}/sesiones`);
        setSesiones(response.data);
      } catch (err: any) {
        console.error("Error fetching sesiones:", err);
        setError(err.response?.data?.detail || 'No se pudo cargar la lista de sesiones.');
      } finally {
        setLoading(false);
      }
    };

    fetchSesiones();
  }, [asignaturaId]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      dateStyle: 'short', timeStyle: 'medium'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Historial de Sesiones de Clase
      </Typography>
      
      {sesiones.length === 0 ? (
        <Alert severity="info">
          No se ha iniciado ninguna sesión para esta asignatura.
        </Alert>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 400 }} aria-label="session list table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell align="right">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sesiones.map((sesion) => (
                <TableRow key={sesion.id}>
                  <TableCell>{formatTimestamp(sesion.fecha)}</TableCell>
                  <TableCell>{sesion.ubicacion || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="outlined"
                      onClick={() => navigate(`/profesor/sesion/${sesion.id}/asistencia`)}
                    >
                      Ver Asistencia
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default ProfessorSessionList;