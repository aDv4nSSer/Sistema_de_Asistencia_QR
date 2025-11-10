import { useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Stack, 
  Button, CircularProgress, Alert 
} from '@mui/material';
import apiClient from '../../services/apiClient';

// Interfaz para el formulario
interface NewClassState {
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string;
}

// Estado inicial para el formulario
const initialState: NewClassState = {
  nombre: '',
  fecha: new Date().toISOString().split('T')[0], // Fecha de hoy
  hora_inicio: '09:00',
  hora_fin: '10:30',
  ubicacion: '',
};

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  professorId: number | undefined;
}

const ProfessorCreateClassModal = ({ open, onClose, onSuccess, professorId }: Props) => {
  const [newClass, setNewClass] = useState<NewClassState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClass({
      ...newClass,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setNewClass(initialState); // Resetea el formulario
    setFormError(null);
    onClose();
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newClass.nombre || !newClass.fecha || !newClass.hora_inicio || !newClass.hora_fin) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    
    if (!professorId) {
      setFormError('No se pudo identificar al profesor. Intenta iniciar sesión de nuevo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...newClass,
        profesor_id: professorId,
      };

      await apiClient.post('/clases/', dataToSubmit);
      onSuccess(); // Llama a la función de éxito (que recarga las clases)

    } catch (err: any) {
      console.error("Error creating class:", err);
      setFormError(err.response?.data?.detail || 'Error al crear la clase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ ...modalStyle, textAlign: 'left' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Crear Nueva Clase
        </Typography>
        <Box component="form" onSubmit={handleCreateClass} noValidate>
          <Stack spacing={2}>
            <TextField
              name="nombre"
              label="Nombre de la Clase"
              value={newClass.nombre}
              onChange={handleFormChange}
              required
              fullWidth
              autoFocus
            />
            <TextField
              name="ubicacion"
              label="Ubicación (Ej: Sala 101)"
              value={newClass.ubicacion}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              name="fecha"
              label="Fecha"
              type="date"
              value={newClass.fecha}
              onChange={handleFormChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                name="hora_inicio"
                label="Hora Inicio"
                type="time"
                value={newClass.hora_inicio}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="hora_fin"
                label="Hora Fin"
                type="time"
                value={newClass.hora_fin}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Crear Clase'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfessorCreateClassModal;