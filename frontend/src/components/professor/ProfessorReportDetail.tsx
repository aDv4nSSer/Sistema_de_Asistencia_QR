import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import apiClient from '../../services/apiClient';

// Interface para el reporte
interface ReporteAlumno {
  alumno_id: number;
  nombre: string;
  email: string;
  sesiones_asistidas: number;
  porcentaje_asistencia: number;
}
interface ReporteData {
  total_sesiones: number;
  alumnos: ReporteAlumno[];
}

interface Props {
  asignaturaId: number | null;
}

const ProfessorReportDetail = ({ asignaturaId }: Props) => {
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asignaturaId) {
      setReporte(null);
      return;
    }

    const fetchReporte = async () => {
      try {
        setLoading(true);
        setError(null);
        // Endpoint de Admin/Profesor para reportes
        const response = await apiClient.get(`/gestion/asignatura/${asignaturaId}/reporte-asistencia`);
        setReporte(response.data);
      } catch (err: any) {
        console.error("Error fetching reporte:", err);
        setError(err.response?.data?.detail || 'No se pudo cargar el reporte.');
      } finally {
        setLoading(false);
      }
    };

    fetchReporte();
  }, [asignaturaId]);

  const getChipColor = (porcentaje: number) => {
    if (porcentaje < 70) return "error";
    if (porcentaje < 85) return "warning";
    return "success";
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

  if (!reporte) {
    return <Alert severity="info">No hay datos de reporte.</Alert>;
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Reporte de Asistencia
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total de sesiones dictadas: <strong>{reporte.total_sesiones}</strong>
      </Typography>
      
      {reporte.total_sesiones === 0 ? (
        <Alert severity="info" sx={{mt: 2}}>
          No se han dictado sesiones para esta asignatura.
        </Alert>
      ) : (
        <TableContainer sx={{mt: 2}}>
          <Table sx={{ minWidth: 650 }} aria-label="report table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre Alumno</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Sesiones Asistidas</TableCell>
                <TableCell align="right">% Asistencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reporte.alumnos.map((alumno) => (
                <TableRow key={alumno.alumno_id}>
                  <TableCell component="th" scope="row">
                    {alumno.nombre}
                  </TableCell>
                  <TableCell>{alumno.email}</TableCell>
                  <TableCell align="right">{alumno.sesiones_asistidas} / {reporte.total_sesiones}</TableCell>
                  <TableCell align="right">
                     <Chip 
                       label={`${alumno.porcentaje_asistencia}%`}
                       color={getChipColor(alumno.porcentaje_asistencia)}
                       variant="outlined"
                       size="small"
                     />
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

export default ProfessorReportDetail;