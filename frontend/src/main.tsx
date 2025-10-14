import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 👇 Importaciones para el tema de MUI
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Nuestro tema personalizado

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Envolvemos toda la aplicación con el ThemeProvider */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza los estilos del navegador */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
