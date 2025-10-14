import { useNavigate, Outlet } from 'react-router-dom';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, Divider,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Button
} from '@mui/material';
import { School as SchoolIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Panel de Control
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6">Asistencia QR</Typography>
        </Toolbar>
        <Divider />
        <List>
          {user?.rol === 'profesor' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/profesor/clases')}>
                <ListItemIcon><SchoolIcon /></ListItemIcon>
                <ListItemText primary="Mis Clases" />
              </ListItemButton>
            </ListItem>
          )}

          {user?.rol === 'estudiante' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/estudiante/asistencia')}>
                <ListItemIcon><CameraAltIcon /></ListItemIcon>
                <ListItemText primary="Escanear QR" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* ÁREA DE CONTENIDO PRINCIPAL - ESTA ES LA SECCIÓN MODIFICADA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* Espaciador para que el contenido no quede debajo de la barra superior */}
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </Box>
    </Box>
  );
};

export default MainLayout;


