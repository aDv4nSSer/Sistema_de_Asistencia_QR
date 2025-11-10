import { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, TextField, Stack, 
  Button, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiClient from '../../services/apiClient';

interface NewAsignaturaState {
  nombre: string;
  codigo: string;
  profesor_id: string;
}

interface Professor {
  id: number;
  nombre: string;
  email: string;
}

const initialState: NewAsignaturaState = {
  nombre: '',
  codigo: '',
  profesor_id: '',
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
}

const CreateAsignaturaModal = ({ open, onClose, onSuccess }: Props) => {
  const [newAsignatura, setNewAsignatura] = useState<NewAsignaturaState>(initialState);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchProfessors = async () => {
        try {
          const response = await apiClient.get('/usuarios/?rol=profesor');
          setProfessors(response.data);
        } catch (err) {
          setFormError('No se pudo cargar la lista de profesores.');
        }
      };
      fetchProfessors();
    }
  }, [open]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAsignatura({
      ...newAsignatura,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
     setNewAsignatura({
      ...newAsignatura,
      profesor_id: e.target.value as string,
    });
  };

  const handleClose = () => {
    setNewAsignatura(initialState);
    setFormError(null);
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newAsignatura.nombre || !newAsignatura.profesor_id || !newAsignatura.codigo) {
      setFormError('Nombre, Código y Profesor son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...newAsignatura,
        profesor_id: parseInt(newAsignatura.profesor_id, 10),
      };

      await apiClient.post('/gestion/asignaturas/', dataToSubmit);
      onSuccess();
      handleClose();

    } catch (err: any) {
      console.error("Error creating asignatura:", err);
      setFormError(err.response?.data?.detail || 'Error al crear la asignatura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ ...modalStyle, textAlign: 'left' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Crear Nueva Asignatura
        </Typography>
        <Box component="form" onSubmit={handleCreate} noValidate>
          <Stack spacing={2}>
            
            <FormControl fullWidth required>
              <InputLabel id="profesor-select-label">Profesor</InputLabel>
              <Select
                labelId="profesor-select-label"
                value={newAsignatura.profesor_id}
                label="Profesor"
                name="profesor_id"
                onChange={handleSelectChange}
              >
                {professors.map((prof) => (
                  <MenuItem key={prof.id} value={String(prof.id)}>
                    {prof.nombre} ({prof.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="nombre"
              label="Nombre de la Asignatura"
              value={newAsignatura.nombre}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              name="codigo"
              label="Código (Ej: INF-101)"
              value={newAsignatura.codigo}
              onChange={handleFormChange}
              required
              fullWidth
            />
            
            {formError && <Alert severity="error">{formError}</Alert>}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Crear Asignatura'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateAsignaturaModal;