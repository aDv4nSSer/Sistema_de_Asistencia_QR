import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Button, // <-- AÑADIDO
  Chip // <-- AÑADIDO
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import apiClient from '../services/apiClient';

// --- 👇 INTERFAZ MODIFICADA ---
interface AsistenciaDetalladaAlumno {
  id: number; // id del alumno
  nombre: string;
  email: string;
  estado: 'presente' | 'ausente' | 'justificado'; // Estado
  timestamp: string | null; // Null si está ausente
  asistencia_id: number | null; // Null si está ausente
}
// --- 👆 FIN DE LA MODIFICACIÓN ---

const ProfessorAttendancePage = () => {
  const { sesionId } = useParams();
  const navigate = useNavigate();
  // --- 👇 TIPO MODIFICADO ---
  const [asistencias, setAsistencias] = useState<AsistenciaDetalladaAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 👇 AÑADIDO: Estado de carga para botones ---
  const [loadingButton, setLoadingButton] = useState<number | null>(null);


  const fetchAttendance = async () => {
    if (!sesionId) return;
    try {
      setLoading(true);
      setError(null);
      // --- 👇 ENDPOINT MODIFICADO ---
      const response = await apiClient.get(`/asistencia/sesiones/${sesionId}/asistencia-detallada`);
      setAsistencias(response.data);
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      setError(err.response?.data?.detail || 'No se pudo cargar la lista de asistencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [sesionId]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Santiago'
    });
  };

  // --- 👇 AÑADIDO: Función para marcar asistencia ---
  const handleMarkPresent = async (alumnoId: number) => {
    if (!sesionId) return;
    
    setLoadingButton(alumnoId); // Activa el loading de ESE botón
    setError(null);

    try {
      await apiClient.post('/asistencia/manual', {
        sesion_clase_id: parseInt(sesionId, 10),
        alumno_id: alumnoId,
        estado: 'presente' // Puedes cambiar esto a 'justificado' si lo prefieres
      });
      // Recarga la lista para mostrar el cambio
      fetchAttendance();
    } catch (err: any) {
      console.error("Error al marcar asistencia", err);
      setError(err.response?.data?.detail || "No se pudo guardar el cambio.");
    } finally {
      setLoadingButton(null); // Desactiva el loading
    }
  };

  // --- 👇 AÑADIDO: Función para color de Chip ---
  const getEstadoChip = (asistencia: AsistenciaDetalladaAlumno) => {
    if (asistencia.estado === 'presente') {
      return <Chip icon={<CheckCircleOutlineIcon />} label="Presente" color="success" size="small" variant="outlined" />;
    }
    // Podrías añadir lógica para 'justificado'
    return <Chip icon={<HelpOutlineIcon />} label="Ausente" color="error" size="small" variant="outlined" />;
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
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      
      {!loading && !error && asistencias.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay alumnos inscritos en esta asignatura.
        </Alert>
      )}

      {/* --- 👇 TABLA MODIFICADA --- */}
      {!loading && !error && asistencias.length > 0 && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre Alumno</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Hora Registro</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistencias.map((asistencia) => (
                <TableRow
                  key={asistencia.id} // Usamos el id del alumno
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {asistencia.nombre}
                  </TableCell>
                  <TableCell>{asistencia.email}</TableCell>
                  <TableCell align="center">
                    {getEstadoChip(asistencia)}
                  </TableCell>
                  <TableCell align="center">
                    {formatTimestamp(asistencia.timestamp)}
                  </TableCell>
                  <TableCell align="right">
                    {asistencia.estado === 'ausente' && (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={loadingButton === asistencia.id}
                        onClick={() => handleMarkPresent(asistencia.id)}
                      >
                        {loadingButton === asistencia.id ? <CircularProgress size={20} /> : 'Justificar'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
    </Paper>
  );
};

export default ProfessorAttendancePage;