import { useState } from 'react'; 
import { useNavigate, Outlet, Link } from 'react-router-dom';
import {
  Box, CssBaseline,
  Drawer, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar // <-- Importamos Toolbar
} from '@mui/material';
import { 
  School as SchoolIcon, 
  CameraAlt as CameraAltIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Home as HomeIcon, 
  AdminPanelSettings as AdminPanelSettingsIcon 
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import logoUni from '../../assets/logo-uni.png'; 

// --- 👇 AÑADIDO: Importamos el Navbar ---
import Navbar from './NavBar.tsx';

const drawerWidth = 240;

const MainLayout = () => {
  // Los hooks para el estado del usuario y el logout se quedan aquí
  // porque 'drawerContent' también los necesita.
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // El estado del 'Drawer' (menú móvil) se queda aquí
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // El 'drawerContent' se queda aquí porque el Drawer está aquí.
  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Toolbar sx={{ p: 2, justifyContent: 'center', minHeight: '70px' }}>
        <img 
          src={logoUni} 
          alt="Logo Universidad" 
          style={{ 
            height: '55px',
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Toolbar>
      <Divider />
      <List>
        {/* --- Menú Profesor --- */}
        {user?.rol === 'profesor' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profesor/asignaturas">
                <ListItemIcon><SchoolIcon /></ListItemIcon>
                <ListItemText primary="Asignaturas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profesor/historial">
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="Historial/Reportes" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* --- Menú Estudiante --- */}
        {user?.rol === 'estudiante' && (
           <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/estudiante/asignaturas">
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Mis Asignaturas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/estudiante/asistencia">
                <ListItemIcon><CameraAltIcon /></ListItemIcon>
                <ListItemText primary="Escanear QR" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/estudiante/historial">
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="Mi Historial" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* --- Menú Admin/TI --- */}
        {(user?.rol === 'administrador' || user?.rol === 'ti') && (
           <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/admin/gestion">
                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                <ListItemText primary="Gestión" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          {/* Reusamos el handleLogout que ya existía */}
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* --- 👇 MODIFICADO: Renderizamos el Navbar --- */}
      {/* Le pasamos la función para controlar el menú móvil */}
      <Navbar onDrawerToggle={handleDrawerToggle} />
      {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}

      {/* El <AppBar> y su contenido se eliminaron de aquí */}

      <Box
        component="nav"
        sx={{ width: { md: 0 }, flexShrink: { md: 0 } }} 
        aria-label="menú principal"
      >
        {/* El Drawer para Móvil (temporal) se queda aquí */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', md: 'none' }, 
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      {/* El contenido principal de la página */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default', 
          p: 3, 
          width: '100%', 
          minHeight: '100vh',
          mt: '70px' // Mantenemos el margen para el AppBar fijo
        }}
      >
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;