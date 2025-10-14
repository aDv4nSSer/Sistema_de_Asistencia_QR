import { createTheme } from '@mui/material/styles';

// Define tu paleta de colores corporativa y otras personalizaciones aquí
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Un azul corporativo clásico
    },
    secondary: {
      main: '#dc004e', // Un color de acento
    },
    background: {
      default: '#f4f6f8', // Un gris muy claro para los fondos
      paper: '#ffffff',   // El blanco para las superficies como tarjetas
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Bordes ligeramente más redondeados
  },
  components: {
    // Sobrescribir estilos de componentes específicos
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Botones sin mayúsculas
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Una sombra sutil para las tarjetas
        }
      }
    }
  },
});

export default theme;
