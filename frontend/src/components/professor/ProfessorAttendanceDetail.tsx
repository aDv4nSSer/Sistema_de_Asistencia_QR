import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import apiClient from '../../services/apiClient';

// Interfaces (copiadas de la antigua ProfessorAttendancePage)
interface AlumnoInfo {
  id: number;
  nombre: string;
  email: string;
}
interface AsistenciaInfo {
  id: number;
  timestamp: string;
  estado: string;
  alumno: AlumnoInfo;
}

interface Props {
  classId: number | null;
}

const ProfessorAttendanceDetail = ({ classId }: Props) => {
  const [asistencias, setAsistencias] = useState<AsistenciaInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo busca si hay una clase seleccionada
    if (!classId) {
      setAsistencias([]); // Limpia la lista si no hay nada seleccionado
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/clases/${classId}/asistencia`);
        setAsistencias(response.data);
      } catch (err: any) {
        console.error("Error fetching attendance:", err);
        setError(err.response?.data?.detail || 'No se pudo cargar la lista.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId]); // Se re-ejecuta CADA VEZ que classId cambia

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      dateStyle: 'short', timeStyle: 'medium',
      timeZone: 'America/Santiago'
    });
  };

  // Vistas condicionales
  if (!classId) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Selecciona una clase de la lista para ver el historial de asistencia.
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Lista de Asistencia
      </Typography>
      
      {asistencias.length === 0 ? (
        <Alert severity="info">
          Nadie ha registrado asistencia para esta clase todavía.
        </Alert>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre Alumno</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Estado</TableCell>
                <TableCell align="right">Fecha y Hora</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistencias.map((asistencia) => (
                <TableRow
                  key={asistencia.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {asistencia.alumno.nombre}
                  </TableCell>
                  <TableCell>{asistencia.alumno.email}</TableCell>
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

export default ProfessorAttendanceDetail;