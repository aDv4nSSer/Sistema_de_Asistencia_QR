import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Button,
  Tabs, Tab, IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuthStore } from '../../store/authStore';
import logoUni from '../../assets/logo-uni.png'; 

interface NavbarProps {
  onDrawerToggle: () => void;
}

const Navbar = ({ onDrawerToggle }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabValue = () => {
    // ... (esta función no cambia)
    if (location.pathname.startsWith('/profesor/asignaturas')) return '/profesor/asignaturas';
    if (location.pathname.startsWith('/profesor/historial')) return '/profesor/historial';
    if (location.pathname.startsWith('/profesor/sesion')) return '/profesor/historial';
    if (location.pathname.startsWith('/estudiante/asignaturas')) return '/estudiante/asignaturas';
    if (location.pathname.startsWith('/estudiante/asistencia')) return '/estudiante/asistencia';
    if (location.pathname.startsWith('/estudiante/historial')) return '/estudiante/historial';
    if (location.pathname.startsWith('/admin/gestion')) return '/admin/gestion';
    if (location.pathname.startsWith('/admin/asignatura/')) return '/admin/gestion';
    return false;
  };
  const activeTab = getTabValue();

  return (
    // El AppBar ahora usará los estilos de theme.ts (fondo blanco)
    <AppBar position="fixed"> 
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '70px' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* --- 👇 MODIFICACIÓN: Botón de menú azul --- */}
          <IconButton
            color="primary" // Color azul oscuro para que sea visible
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle} 
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
          
          <img 
            src={logoUni} 
            alt="Logo Universidad" 
            style={{ 
              height: '80px', // Se mantiene el tamaño
              width: 'auto',
              marginRight: '24px',
              objectFit: 'contain'
            }} 
          />

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Las Tabs ahora usarán los nuevos estilos del theme */}
            <Tabs value={activeTab} aria-label="pestañas de navegación">
              {user?.rol === 'profesor' && [
                <Tab label="Asignaturas" component={Link} to="/profesor/asignaturas" value="/profesor/asignaturas" key="p1" />,
                <Tab label="Historial/Reportes" component={Link} to="/profesor/historial" value="/profesor/historial" key="p2" />
              ]}
              {user?.rol === 'estudiante' && [
                <Tab label="Mis Asignaturas" component={Link} to="/estudiante/asignaturas" value="/estudiante/asignaturas" key="e1" />,
                <Tab label="Escanear QR" component={Link} to="/estudiante/asistencia" value="/estudiante/asistencia" key="e2" />,
                <Tab label="Mi Historial" component={Link} to="/estudiante/historial" value="/estudiante/historial" key="e3" />
              ]}
              {(user?.rol === 'administrador' || user?.rol === 'ti') && [
                <Tab label="Gestión" component={Link} to="/admin/gestion" value="/admin/gestion" key="a1" />
              ]}
            </Tabs>
          </Box>
        </Box>
        
        {/* --- 👇 MODIFICACIÓN: Botón de logout azul --- */}
        <Button 
          onClick={handleLogout} 
          variant="contained" 
          color="primary" // Color azul oscuro (principal)
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
        >
          Cerrar Sesión
        </Button>
        {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}
        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;