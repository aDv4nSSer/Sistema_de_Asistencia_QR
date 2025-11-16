import { Paper, Typography, Box, Stack } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuthStore } from '../../store/authStore';

const AdminWelcomeCard = () => {
  const { user } = useAuthStore();
  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2}
        alignItems="center"
      >
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h5" gutterBottom>
            Panel de Gestión
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido, {user?.nombre || user?.rol}. Hoy es {today}.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AdminWelcomeCard;