import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Fab, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/apiClient';
import CreateAsignaturaModal from '../components/admin/CreateAsignaturaModal';
import UserManagement from '../components/admin/UserManagement';
// --- 👇 AÑADIDO ---
import AdminReportPanel from '../components/admin/AdminReportPanel';
// --- 👆 FIN ---

interface Asignatura {
  id: number;
  nombre: string;
  codigo: string | null;
  profesor: {
    nombre: string;
  } | null;
  alumnos_inscritos: any[];
}

// --- Componente de Tab de Asignaturas (Gestión de TI) ---
const AsignaturaManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchAsignaturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/asignaturas/');
      setAsignaturas(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las asignaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre Asignatura</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Profesor Asignado</TableCell>
              <TableCell align="right">Alumnos Inscritos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignaturas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay asignaturas creadas.</TableCell>
              </TableRow>
            )}
            {asignaturas.map((asignatura) => (
              <TableRow key={asignatura.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{asignatura.nombre}</TableCell>
                <TableCell>{asignatura.codigo}</TableCell>
                <TableCell>{asignatura.profesor?.nombre || <Alert severity="warning" sx={{p: 0}}>Sin profesor</Alert>}</TableCell>
                <TableCell align="right">{asignatura.alumnos_inscritos.length}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/admin/asignatura/${asignatura.id}/alumnos`)}
                  >
                    Gestionar Alumnos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {user?.rol === 'ti' && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setModalOpen(true)}>
          <AddIcon />
        </Fab>
      )}

      <CreateAsignaturaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAsignaturas}
      />
    </Box>
  );
};

// --- Componente Principal de la Página de Admin ---
const AdminPage = () => {
  const { user } = useAuthStore();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, width: '100%' }}
    >
      <Typography variant="h4" gutterBottom>
        Panel de Gestión ({user?.rol})
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Panel de gestión">
          <Tab label="Gestión de Asignaturas" id="tab-0" />
          {user?.rol === 'ti' && <Tab label="Gestión de Usuarios" id="tab-1" />}
          {user?.rol === 'administrador' && <Tab label="Reportes de Asistencia" id="tab-1" />}
        </Tabs>
      </Box>

      {/* Pestaña 0: Gestión de Asignaturas (TI y Admin) */}
      {tabIndex === 0 && (
        <AsignaturaManagement />
      )}

      {/* Pestaña 1: Gestión de Usuarios (Solo TI) */}
      {tabIndex === 1 && user?.rol === 'ti' && (
        <UserManagement />
      )}
      
      {/* Pestaña 1: Reportes (Solo Admin) */}
      {/* --- 👇 MODIFICADO --- */}
      {tabIndex === 1 && user?.rol === 'administrador' && (
        <AdminReportPanel />
      )}
      {/* --- 👆 FIN --- */}

    </Paper>
  );
};

export default AdminPage;