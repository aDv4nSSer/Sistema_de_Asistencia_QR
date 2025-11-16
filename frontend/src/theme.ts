import { createTheme } from '@mui/material/styles';

// Paleta de colores basada en tu logo
const universidadPalette = {
  // Azul oscuro principal del logo
  primary: {
    main: '#003058', 
    contrastText: '#FFFFFF',
  },
  // Azul claro del logo
  secondary: {
    main: '#0096DB',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F4F6F8', // Gris claro de fondo
    paper: '#FFFFFF',   // Blanco para las tarjetas
  },
  text: {
    primary: '#333333', 
    secondary: '#666666', 
  }
};

const theme = createTheme({
  palette: universidadPalette, // Usamos la nueva paleta

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
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
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 12, 
        }
      }
    },
    
    // --- 👇 MODIFICACIÓN: AppBar BLANCO ---
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // Fondo blanco
          color: universidadPalette.text.primary, // Texto oscuro
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          minHeight: '70px',
          display: 'flex',
          justifyContent: 'center',
        }
      }
    },
    // --- 👆 FIN DE LA MODIFICACIÓN ---

    // --- 👇 MODIFICACIÓN: Pestañas con colores del logo ---
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
          marginLeft: '24px',
        },
        indicator: {
          // El indicador usará el azul oscuro
          backgroundColor: universidadPalette.primary.main,
          height: 4,
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: '70px',
          color: universidadPalette.text.secondary, // Color inactivo (gris)
          '&.Mui-selected': {
            // Color activo (azul oscuro)
            color: universidadPalette.primary.main, 
          }
        }
      }
    }
    // --- 👆 FIN DE LA MODIFICACIÓN ---
  },
});

export default theme;