import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Este componente detecta cada cambio de ruta (URL) y 
 * fuerza al navegador a hacer scroll hasta la parte superior.
 */
const ScrollToTop = () => {
  // Extrae el 'pathname' (ej: /admin/gestion) de la ubicación actual
  const { pathname } = useLocation();

  // Este 'efecto' se ejecuta CADA VEZ que el 'pathname' cambia
  useEffect(() => {
    // Le dice a la ventana que se mueva a la posición (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // El array de dependencias [pathname] es la clave

  // Este componente no renderiza nada visual, es solo lógica.
  return null;
};

export default ScrollToTop;