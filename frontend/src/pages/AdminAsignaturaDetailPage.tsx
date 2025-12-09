import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Button, Grid, Autocomplete, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../services/apiClient';

// --- AÑADIDO: Importar el nuevo componente ---
import ScheduleManager from '../components/admin/ScheduleManager';

// --- AÑADIDO: Interfaz de Horario ---
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
  asignatura_id: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface Asignatura {
  id: number;
  nombre: string;
  profesor: Usuario | null;
  alumnos_inscritos: Usuario[];
  // ---  AÑADIDO: horarios en la interfaz ---
  horarios: Horario[];
}

const AdminAsignaturaDetailPage = () => {
  const { asignaturaId } = useParams();
  const navigate = useNavigate();
  const [asignatura, setAsignatura] = useState<Asignatura | null>(null);
  const [allStudents, setAllStudents] = useState<Usuario[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Usuario | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!asignaturaId) return;
    try {
      setLoading(true);
      setError(null);
      const [asignaturaResponse, studentsResponse] = await Promise.all([
        apiClient.get(`/asignaturas/${asignaturaId}`),
        apiClient.get('/usuarios/?rol=estudiante')
      ]);
      setAsignatura(asignaturaResponse.data);
      setAllStudents(studentsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [asignaturaId]);

  const handleInscribir = async () => {
    if (!selectedStudent || !asignaturaId) {
      setActionError("Selecciona un estudiante.");
      return;
    }
    if (asignatura?.alumnos_inscritos.find(a => a.id === selectedStudent.id)) {
      setActionError("Este alumno ya está inscrito.");
      return;
    }

    setActionError(null);
    try {
      await apiClient.post(`/gestion/asignatura/${asignaturaId}/inscribir/${selectedStudent.id}`);
      fetchDetails(); // Recarga todo
      setSelectedStudent(null);
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al inscribir.');
    }
  };

  const handleDesinscribir = async (alumnoId: number) => {
    if (!asignaturaId) return;
    setActionError(null);
    try {
      await apiClient.delete(`/gestion/asignatura/${asignaturaId}/inscribir/${alumnoId}`);
      fetchDetails(); // Recarga todo
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al desinscribir.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!asignatura) {
    return <Alert severity="info">Asignatura no encontrada.</Alert>;
  }

  // Filtramos estudiantes disponibles
  const availableStudents = allStudents.filter(
    (student) => !asignatura.alumnos_inscritos.some((inscrito) => inscrito.id === student.id)
  );

  return (
    <Box>
      {/* Tarjeta 1: Gestión de Alumnos */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom component="div" sx={{ mb: 0, ml: 1 }}>
              Gestionar: {asignatura.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 1.5 }}>
              Profesor: {asignatura.profesor?.nombre || 'No asignado'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={8}>
            <Autocomplete
              options={availableStudents}
              getOptionLabel={(option) => `${option.nombre} (${option.email})`}
              value={selectedStudent}
              onChange={(_event, newValue) => {
                setSelectedStudent(newValue);
              }}
              renderInput={(params) => <TextField {...params} label="Buscar Alumno a Inscribir" />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleInscribir}
              disabled={!selectedStudent}
              fullWidth
              sx={{ height: '100%' }}
            >
              Inscribir
            </Button>
          </Grid>
        </Grid>
        
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

        <Typography variant="h6" gutterBottom>
          Alumnos Inscritos ({asignatura.alumnos_inscritos.length})
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre Alumno</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asignatura.alumnos_inscritos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay alumnos inscritos en esta asignatura.
                  </TableCell>
                </TableRow>
              )}
              {asignatura.alumnos_inscritos.map((alumno) => (
                <TableRow
                  key={alumno.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {alumno.nombre}
                  </TableCell>
                  <TableCell>{alumno.email}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDesinscribir(alumno.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ---  AÑADIDO: Tarjeta 2: Gestión de Horarios --- */}
      <ScheduleManager 
        asignaturaId={asignatura.id}
        horariosActuales={asignatura.horarios}
        onHorarioChanged={fetchDetails} // Le decimos que recargue todo
      />
      {/* ---  FIN DE LA MODIFICACIÓN --- */}
    </Box>
  );
};

export default AdminAsignaturaDetailPage;
