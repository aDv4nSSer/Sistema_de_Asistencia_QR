import { createTheme } from '@mui/material/styles';

// Paleta de colores extraída de los mockups
const theme = createTheme({
  palette: {
    // Azul principal (botones, pestañas activas)
    primary: {
      main: '#1976D2', 
    },
    // Azul oscuro (Header)
    secondary: {
      main: '#003366', 
    },
    // Cyan para etiquetas (Sala)
    info: {
      main: '#00BCD4',
    },
    background: {
      default: '#F4F6F8', // Gris claro de fondo
      paper: '#FFFFFF',   // Blanco para las tarjetas
    },
    text: {
      primary: '#333333', 
      secondary: '#666666', 
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#333333',
    },
    h5: {
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      color: '#333333',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
        },
        // Estilo para el botón "Cerrar Sesión" del header
        containedSecondary: {
          backgroundColor: '#003366',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#002244',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 12, 
        }
      }
    },
    // Estilos para el Header (AppBar)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }
      }
    },
    // Estilos para las Pestañas (Tabs) en el Header
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
          marginLeft: '24px',
        },
        indicator: {
          backgroundColor: '#1976D2', // Azul
          height: 4,
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: '64px', // Alinear con altura del header
          color: '#666666', // Color inactivo
          '&.Mui-selected': {
            color: '#1976D2', // Color activo
          }
        }
      }
    }
  },
});

export default theme;