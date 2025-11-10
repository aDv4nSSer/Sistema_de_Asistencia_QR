import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import apiClient from '../services/apiClient';

// --- INTERFACES MODIFICADAS ---
interface AsignaturaInfo {
  id: number;
  nombre: string;
  codigo: string | null;
}

interface SesionClaseInfo {
  id: number;
  fecha: string; // La fecha vendrá como string
  asignatura: AsignaturaInfo;
}

interface AsistenciaInfo {
  id: number;
  timestamp: string; 
  estado: string;
  sesion_clase: SesionClaseInfo; // <-- MODIFICADO
}
// --- FIN DE LA MODIFICACIÓN ---

const StudentHistoryPage = () => {
  const [asistencias, setAsistencias] = useState<AsistenciaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/asistencia/mi-historial');
        setAsistencias(response.data);
      } catch (err: any) {
        console.error("Error fetching history:", err);
        setError(err.response?.data?.detail || 'No se pudo cargar tu historial.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatSesionDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'America/Santiago'
    });
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, width: '100%' }}
    >
      <Typography variant="h4" gutterBottom>
        Mi Historial de Asistencia
      </Typography>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      
      {!loading && !error && asistencias.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tienes ninguna asistencia registrada.
        </Alert>
      )}

      {!loading && !error && asistencias.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Asignatura</TableCell>
                <TableCell align="right">Fecha de la Sesión</TableCell>
                <TableCell align="right">Estado</TableCell>
                <TableCell align="right">Fecha de Registro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistencias.map((asistencia) => (
                <TableRow
                  key={asistencia.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {asistencia.sesion_clase.asignatura.nombre}
                  </TableCell>
                  <TableCell align="right">
                    {formatSesionDate(asistencia.sesion_clase.fecha)}
                  </TableCell>
                  <TableCell align="right">{asistencia.estado}</TableCell>
                  <TableCell align="right">{formatTimestamp(asistencia.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default StudentHistoryPage;