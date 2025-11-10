import { Paper, Typography } from '@mui/material';
import { useAuthStore } from '../../store/authStore';

const ProfessorWelcomeCard = () => {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    // --- INICIO DE LA CORRECCIÓN ---
    // Quitamos mx: "auto" y lo hacemos transparente
    <Paper sx={{ p: 3, mb: 3, boxShadow: 'none', textAlign: 'left', bgcolor: '#ffffffff' }}>
    {/* --- FIN DE LA CORRECCIÓN --- */}
      <Typography variant="h5" gutterBottom>
        Bienvenido, {user?.nombre || 'Profesor'}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {today}
      </Typography>
    </Paper>
  );
};

export default ProfessorWelcomeCard;