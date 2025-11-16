import { useState, useEffect } from 'react';
import { 
  Box, Modal, Fab, Grid, Alert, CircularProgress, 
  Card, CardContent, Typography, Stack, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import SkeletonCard from '../components/SkeletonCard';
import ProfessorCreateClassModal from '../components/professor/ProfessorCreateClassModal';
import ProfessorWelcomeCard from '../components/professor/ProfessorWelcomeCard'; // <-- Importamos el saludo

// Interfaz que coincide con el schema 'Clase' del backend
interface Clase {
  id: number; nombre: string; fecha: string; profesor_id: number;
  hora_inicio: string; hora_fin: string; ubicacion: string | null;
}

const ProfessorClassesPage = () => {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estados para los Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const professorId = useAuthStore((state) => state.user?.id); 

  const fetchClasses = async () => {
    try {
      setLoading(true); setError(null);
      const response = await apiClient.get('/clases/mis-clases');
      setClasses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar las clases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []); 

  // --- Manejadores de Modales ---
  const handleGenerateQr = async (classId: number) => {
    setSelectedClassId(classId);
    setQrCodeUrl(null); 
    setQrModalOpen(true);
    try {
      const response = await apiClient.post(`/qr/generate/${classId}`, {}, {
        responseType: 'blob'
      });
      setQrCodeUrl(URL.createObjectURL(response.data));
    } catch (error) {
      console.error("Error generando el QR:", error);
    }
  };
  const handleCloseQrModal = () => setQrModalOpen(false);
  const handleOpenCreateModal = () => setCreateModalOpen(true);
  const handleCloseCreateModal = () => setCreateModalOpen(false);

  // --- Renderizado del contenido ---
  const renderContent = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}><SkeletonCard /></Grid>
          ))}
        </Grid>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (classes.length === 0) {
      return <Alert severity="info">No tienes clases registradas. Usa el botón (+) para crear una.</Alert>;
    }
    return (
      <Grid container spacing={3}>
        {classes.map((clase) => (
          <Grid item xs={12} md={6} lg={4} key={clase.id}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6" noWrap title={clase.nombre}>
                    {clase.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {new Date(clase.fecha + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })} 
                    {' - '} {clase.hora_inicio} a {clase.hora_fin}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
                  <Button 
                    variant="contained" startIcon={<QrCode2Icon />}
                    onClick={() => handleGenerateQr(clase.id)} sx={{ flex: 1 }} 
                  >
                    Generar QR
                  </Button>
                  <Button 
                    variant="outlined" startIcon={<HistoryIcon />}
                    onClick={() => navigate(`/profesor/clase/${clase.id}/asistencia`)} sx={{ flex: 1 }} 
                  >
                    Asistencias
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      {/* Tarjeta de Bienvenida */}
      <ProfessorWelcomeCard />

      {/* Contenido de la página (lista de clases) */}
      {renderContent()}

      {/* Botón flotante */}
      <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={handleOpenCreateModal}>
        <AddIcon />
      </Fab>

      {/* Modal QR */}
      <Modal open={qrModalOpen} onClose={handleCloseQrModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper', boxShadow: 24, p: 4, textAlign: 'center', borderRadius: 2
        }}>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt={`QR para ${selectedClassId}`} style={{ maxWidth: '100%' }} />
          ) : (
            <CircularProgress />
          )}
          <Typography variant="h6" sx={{ mt: 2 }}>Escanea este QR</Typography>
        </Box>
      </Modal>

      {/* Modal Crear Clase */}
      <ProfessorCreateClassModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={() => {
          handleCloseCreateModal();
          fetchClasses(); 
        }}
        professorId={professorId}
      />
    </Box>
  );
};

export default ProfessorClassesPage;