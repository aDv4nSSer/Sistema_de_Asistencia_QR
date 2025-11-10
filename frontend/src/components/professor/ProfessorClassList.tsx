import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button,
  Grid, Alert, Stack
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import HistoryIcon from '@mui/icons-material/History';
import SkeletonCard from '../SkeletonCard';

// Interfaz que coincide con el schema 'Clase' del backend
interface Clase {
  id: number;
  nombre: string;
  fecha: string; 
  profesor_id: number;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string | null;
}

interface Props {
  classes: Clase[];
  loading: boolean;
  error: string | null;
  onGenerateQr: (classId: number) => void;
}

const ProfessorClassList = ({ classes, loading, error, onGenerateQr }: Props) => {
  const navigate = useNavigate();

  const renderContent = () => {
    if (loading) {
      return (
        // --- 👇 CAMBIO 1: Centra las cajas (el grupo) ---
        <Grid container component="div" spacing={3} sx={{ justifyContent: 'center' }}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item component="div" xs={12} md={6} lg={4} key={index}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      );
    }
    if (error) {
      return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }
    if (classes.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tienes ninguna clase registrada. Usa el botón (+) para crear una.
        </Alert>
      );
    }
    return (
      // --- 👇 CAMBIO 1 (bis): Centra las cajas (el grupo) ---
      <Grid container component="div" spacing={3} sx={{ justifyContent: 'center', mx: "auto" }}>
        {classes.map((clase) => (
          <Grid item component="div" xs={12} md={6} lg={4} key={clase.id}>
            <Card>
              {/* --- 👇 CAMBIO 2: Centra el contenido DENTRO de la tarjeta --- */}
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                alignItems: 'center' 
              }}>
                {/* --- 👇 CAMBIO 3: Centra el bloque de texto --- */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="h6" noWrap title={clase.nombre}>
                    {clase.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {new Date(clase.fecha + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })} 
                    {' - '} 
                    {clase.hora_inicio} a {clase.hora_fin}
                  </Typography>
                </Box>
                {/* --- 👆 FIN DE LOS CAMBIOS INTERNOS --- */}
                
                {/* Botones de acción */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
                  <Button 
                    variant="contained"
                    startIcon={<QrCode2Icon />}
                    onClick={() => onGenerateQr(clase.id)}
                    sx={{ flex: 1 }} 
                  >
                    Generar QR
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate(`/profesor/clase/${clase.id}/asistencia`)}
                    sx={{ flex: 1 }} 
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

  return <Box sx={{ width: '100%' }}>{renderContent()}</Box>;
};

export default ProfessorClassList;