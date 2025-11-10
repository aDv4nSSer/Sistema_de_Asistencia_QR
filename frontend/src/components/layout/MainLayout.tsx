import { useState } from 'react'; 
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box, CssBaseline, AppBar, Toolbar, Button,
  Tabs, Tab,
  Drawer, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton
} from '@mui/material';
import { 
  Menu as MenuIcon,
  School as SchoolIcon, 
  CameraAlt as CameraAltIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Home as HomeIcon, 
  AdminPanelSettings as AdminPanelSettingsIcon 
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import logoUni from '../../assets/logo-uni.png'; 

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabValue = () => {
    // Profesor
    if (location.pathname.startsWith('/profesor/asignaturas')) return '/profesor/asignaturas';
    if (location.pathname.startsWith('/profesor/historial')) return '/profesor/historial';
    if (location.pathname.startsWith('/profesor/sesion')) return '/profesor/historial';
    // Estudiante
    if (location.pathname.startsWith('/estudiante/asignaturas')) return '/estudiante/asignaturas';
    if (location.pathname.startsWith('/estudiante/asistencia')) return '/estudiante/asistencia';
    if (location.pathname.startsWith('/estudiante/historial')) return '/estudiante/historial';
    // Admin/TI
    if (location.pathname.startsWith('/admin/gestion')) return '/admin/gestion';
    if (location.pathname.startsWith('/admin/asignatura/')) return '/admin/gestion';
    return false;
  };
  const activeTab = getTabValue(); 

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Toolbar sx={{ p: 2, justifyContent: 'center' }}>
        <img src={logoUni} alt="Logo Universidad" style={{ maxHeight: '40px', objectFit: 'contain' }} />
      </Toolbar>
      <Divider />
      <List>
        {/* --- Menú Profesor --- */}
        {user?.rol === 'profesor' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profesor/asignaturas" selected={activeTab === '/profesor/asignaturas'}>
                <ListItemIcon><SchoolIcon /></ListItemIcon>
                <ListItemText primary="Asignaturas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profesor/historial" selected={activeTab === '/profesor/historial'}>
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
              <ListItemButton component={Link} to="/estudiante/asignaturas" selected={activeTab === '/estudiante/asignaturas'}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Mis Asignaturas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/estudiante/asistencia" selected={activeTab === '/estudiante/asistencia'}>
                <ListItemIcon><CameraAltIcon /></ListItemIcon>
                <ListItemText primary="Escanear QR" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/estudiante/historial" selected={activeTab === '/estudiante/historial'}>
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
              <ListItemButton component={Link} to="/admin/gestion" selected={activeTab === '/admin/gestion'}>
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
      <AppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: '#003366' }} // <-- Se oculta en desktop
            >
              <MenuIcon />
            </IconButton>
            <img 
              src={logoUni} 
              alt="Logo Universidad" 
              style={{ maxHeight: '80px', marginRight: '24px' }} 
            />
            {/* --- 👇 MODIFICACIÓN --- */}
            {/* Mantenemos las Pestañas, pero solo se muestran en escritorio ('md') */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Tabs value={activeTab} aria-label="pestañas de navegación">
                {/* Pestañas Profesor */}
                {user?.rol === 'profesor' && [
                  <Tab label="Asignaturas" component={Link} to="/profesor/asignaturas" value="/profesor/asignaturas" key="p1" />,
                  <Tab label="Historial/Reportes" component={Link} to="/profesor/historial" value="/profesor/historial" key="p2" />
                ]}
                {/* Pestañas Estudiante */}
                {user?.rol === 'estudiante' && [
                  <Tab label="Mis Asignaturas" component={Link} to="/estudiante/asignaturas" value="/estudiante/asignaturas" key="e1" />,
                  <Tab label="Escanear QR" component={Link} to="/estudiante/asistencia" value="/estudiante/asistencia" key="e2" />,
                  <Tab label="Mi Historial" component={Link} to="/estudiante/historial" value="/estudiante/historial" key="e3" />
                ]}
                 {/* Pestañas Admin/TI */}
                {(user?.rol === 'administrador' || user?.rol === 'ti') && [
                  <Tab label="Gestión" component={Link} to="/admin/gestion" value="/admin/gestion" key="a1" />
                ]}
              </Tabs>
            </Box>
            {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
          </Box>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            sx={{
              backgroundColor: '#022873',
              color: '#FFFFFF',
              display: { xs: 'none', md: 'block' },
              '&:hover': { backgroundColor: '#023E73' }
            }}
          >
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* --- 👇 MODIFICACIÓN --- */}
      {/* Eliminamos el 'Drawer' permanente de escritorio.
        Ahora este 'Box' SOLO contiene el 'Drawer' temporal para móviles.
      */}
      <Box
        component="nav"
        sx={{ width: { md: 0 }, flexShrink: { md: 0 } }} // <-- Ya no ocupa espacio en desktop
        aria-label="menú principal"
      >
        {/* Drawer para Móvil (temporal) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', md: 'none' }, // <-- Se oculta en desktop
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default', 
          p: 3, 
          width: '100%', // <-- Corregido: ocupa el 100% del ancho
          minHeight: '100vh',
          mt: '66px' 
        }}
      >
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;