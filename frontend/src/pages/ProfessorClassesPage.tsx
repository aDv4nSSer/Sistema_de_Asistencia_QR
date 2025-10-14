import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import apiClient from '../services/apiClient';
import SkeletonCard from '../components/SkeletonCard';

// Interfaz para definir la estructura de una clase
interface Clase {
  id: number;
  nombre: string;
  fecha: string;
}

// Datos de ejemplo para la simulación
const mockClasses: Clase[] = [
  { id: 1, nombre: 'Sistemas inteligentes', fecha: '2025-10-17' },
  { id: 2, nombre: 'Analisis de datos', fecha: '2025-10-17' },
  { id: 3, nombre: 'Taller de ingenieria de software', fecha: '2025-10-15' },
];

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const ProfessorClassesPage = () => {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // useEffect para simular la carga de datos
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulación de llamada a API con un retraso
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        // En un futuro: const response = await apiClient.get('/clases');
        setClasses(mockClasses);
      } catch (err) {
        setError('No se pudieron cargar las clases. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleGenerateQr = async (classId: number) => {
    setSelectedClassId(classId);
    try {
      const response = await apiClient.post(`/qr/generate/${classId}`, {}, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
      setModalOpen(true);
    } catch (error) {
      console.error("Error generando el QR:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setQrCodeUrl(null);
    setSelectedClassId(null);
  };
  
  // Renderizado condicional basado en el estado
  const renderContent = () => {
    if (loading) {
      return (
        <Grid container component="div" spacing={3}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item component="div" xs={12} md={6} lg={4} key={index}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    return (
      <Grid container component="div" spacing={3}>
        {classes.map((clase) => (
          <Grid item component="div" xs={12} md={6} lg={4} key={clase.id}>
            <Card elevation={3}>
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    {clase.nombre}
                  </Typography>
                  <Typography color="text.secondary">
                    {new Date(clase.fecha).toLocaleDateString()}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<QrCode2Icon />}
                  onClick={() => handleGenerateQr(clase.id)}
                >
                  Generar QR
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Clases
      </Typography>
      
      {renderContent()}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR para la clase ${selectedClassId}`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ) : (
            <Typography variant="body1">Generando QR...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfessorClassesPage;
