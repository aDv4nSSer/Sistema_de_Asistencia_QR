import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../services/apiClient';

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

const ProfessorAttendancePage = () => {
  const { sesionId } = useParams(); // <-- MODIFICADO
  const navigate = useNavigate();
  const [asistencias, setAsistencias] = useState<AsistenciaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!sesionId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/asignaturas/sesiones/${sesionId}/asistencia`);
        setAsistencias(response.data);
      } catch (err: any) {
        console.error("Error fetching attendance:", err);
        setError(err.response?.data?.detail || 'No se pudo cargar la lista de asistencia.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [sesionId]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom component="div" sx={{ mb: 0, ml: 1 }}>
          Asistencia de la Sesión
        </Typography>
      </Box>
      
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      
      {!loading && !error && asistencias.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nadie ha registrado asistencia para esta sesión todavía.
        </Alert>
      )}

      {!loading && !error && asistencias.length > 0 && (
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

export default ProfessorAttendancePage;