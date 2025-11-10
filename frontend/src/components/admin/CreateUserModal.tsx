import { useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Stack, 
  Button, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiClient from '../../services/apiClient';

// Interface para el formulario
interface NewUserState {
  nombre: string;
  email: string;
  contrasena: string;
  rol: 'estudiante' | 'profesor' | 'administrador' | 'ti';
}

const initialState: NewUserState = {
  nombre: '',
  email: '',
  contrasena: '',
  rol: 'estudiante',
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

const CreateUserModal = ({ open, onClose, onSuccess }: Props) => {
  const [newUser, setNewUser] = useState<NewUserState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
     setNewUser({
      ...newUser,
      rol: e.target.value as NewUserState['rol'],
    });
  };

  const handleClose = () => {
    setNewUser(initialState);
    setFormError(null);
    onClose();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUser.nombre || !newUser.email || !newUser.contrasena || !newUser.rol) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...newUser,
        contraseña: newUser.contrasena,
      };

      await apiClient.post('/usuarios/', dataToSubmit);
      onSuccess();
      handleClose();

    } catch (err: any) {
      console.error("Error creating user:", err);
      setFormError(err.response?.data?.detail || 'Error al crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ ...modalStyle, textAlign: 'left' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Crear Nuevo Usuario
        </Typography>
        <Box component="form" onSubmit={handleCreateUser} noValidate>
          <Stack spacing={2}>
            
            <TextField
              name="nombre"
              label="Nombre Completo"
              value={newUser.nombre}
              onChange={handleFormChange}
              required
              fullWidth
              autoFocus
            />
            <TextField
              name="email"
              label="Correo Electrónico"
              type="email"
              value={newUser.email}
              onChange={handleFormChange}
              required
              fullWidth
            />
             <TextField
              name="contrasena"
              label="Contraseña"
              type="password"
              value={newUser.contrasena}
              onChange={handleFormChange}
              required
              fullWidth
            />
            
            <FormControl fullWidth required>
              <InputLabel id="rol-select-label">Rol</InputLabel>
              <Select
                labelId="rol-select-label"
                value={newUser.rol}
                label="Rol"
                name="rol"
                onChange={handleSelectChange}
              >
                <MenuItem value="estudiante">Estudiante</MenuItem>
                <MenuItem value="profesor">Profesor</MenuItem>
                <MenuItem value="administrador">Administrador</MenuItem>
                <MenuItem value="ti">TI</MenuItem>
              </Select>
            </FormControl>
            
            {formError && <Alert severity="error">{formError}</Alert>}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Crear Usuario'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateUserModal;