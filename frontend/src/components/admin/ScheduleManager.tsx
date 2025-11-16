import { useState } from 'react';
import { 
  Box, Typography, Stack, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import apiClient from '../../services/apiClient';

// Interfaces (copiadas de schemas.py)
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

interface NewHorarioState {
  dia_semana: DiaSemana | "";
  hora_inicio: string;
  hora_fin: string;
}

interface Props {
  asignaturaId: number;
  horariosActuales: Horario[];
  onHorarioChanged: () => void; 
}

const ScheduleManager = ({ asignaturaId, horariosActuales, onHorarioChanged }: Props) => {
  const [newHorario, setNewHorario] = useState<NewHorarioState>({
    dia_semana: "",
    hora_inicio: "09:00",
    hora_fin: "10:30",
  });
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHorario({ ...newHorario, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (e: any) => {
    setNewHorario({ ...newHorario, dia_semana: e.target.value as DiaSemana });
  };

  const handleAddHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorario.dia_semana || !newHorario.hora_inicio || !newHorario.hora_fin) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError(null);
    try {
      await apiClient.post('/gestion/horarios/', {
        ...newHorario,
        asignatura_id: asignaturaId,
      });
      setNewHorario({ dia_semana: "", hora_inicio: "09:00", hora_fin: "10:30" });
      onHorarioChanged(); 
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear el horario.");
    }
  };

  const handleDeleteHorario = async (horarioId: number) => {
    setError(null);
    try {
      await apiClient.delete(`/gestion/horarios/${horarioId}`);
      onHorarioChanged();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al eliminar el horario.");
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gestionar Horarios de Clase
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Formulario para añadir nuevo horario */}
      <Box component="form" onSubmit={handleAddHorario} sx={{ mb: 2 }}>
        {/* --- 👇 ¡CORRECCIÓN AQUÍ! (Se eliminó 'alignItems="center"') --- */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {/* --- 👆 FIN DE LA CORRECCIÓN --- */}
          <FormControl fullWidth sx={{ minWidth: 150 }}>
            <InputLabel id="dia-label">Día</InputLabel>
            <Select
              labelId="dia-label"
              name="dia_semana"
              value={newHorario.dia_semana}
              label="Día"
              onChange={handleSelectChange}
            >
              {Object.values(DiaSemana).map((dia) => (
                <MenuItem key={dia} value={dia}>{dia}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            name="hora_inicio"
            label="Hora Inicio"
            type="time"
            value={newHorario.hora_inicio}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="hora_fin"
            label="Hora Fin"
            type="time"
            value={newHorario.hora_fin}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<AddCircleIcon />}
            // Se elimina la altura fija para que se ajuste al 'Stack'
          >
            Añadir
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Lista de horarios existentes */}
      <Typography variant="body1" gutterBottom>
        Horarios Programados
      </Typography>
      {horariosActuales.length === 0 ? (
        <Alert severity="info">No hay horarios programados para esta asignatura.</Alert>
      ) : (
        <List dense>
          {horariosActuales.map((h) => (
            <ListItem key={h.id}>
              <ListItemText
                primary={`${h.dia_semana}`}
                secondary={`De ${h.hora_inicio} a ${h.hora_fin}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteHorario(h.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ScheduleManager;