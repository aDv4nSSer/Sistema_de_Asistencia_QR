import { useState } from 'react';
import { 
  Box, Typography, Grid, Alert, List, ListItemButton, 
  ListItemText, Paper
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

// --- Importamos el componente que muestra el detalle ---
import ProfessorAttendanceDetail from './ProfessorAttendanceDetail';

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
}

const ProfessorHistoryView = ({ classes, loading, error }: Props) => {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
  };

  // Función para formatear fecha para la lista
  const formatClassDate = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const renderClassList = () => {
    if (loading) {
      return (
        <Box>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (classes.length === 0) {
      return <Alert severity="info">No tienes clases para revisar el historial.</Alert>;
    }
    return (
      <Paper>
        <List component="nav" sx={{ p: 0 }}>
          {classes.map((clase) => (
            <ListItemButton
              key={clase.id}
              selected={selectedClassId === clase.id}
              onClick={() => handleClassClick(clase.id)}
            >
              <ListItemText 
                primary={clase.nombre} 
                secondary={formatClassDate(clase.fecha)} 
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Columna Izquierda: Lista de Clases */}
      <Grid item xs={12} md={4}>
        <Typography variant="h5" gutterBottom>
          Seleccionar Clase
        </Typography>
        {renderClassList()}
      </Grid>

      {/* Columna Derecha: Detalle de Asistencia */}
      <Grid item xs={12} md={8}>
        <ProfessorAttendanceDetail classId={selectedClassId} />
      </Grid>
    </Grid>
  );
};

export default ProfessorHistoryView;