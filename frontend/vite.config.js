import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // El proxy que ya teníamos
    proxy: {
      '/api': {
        target: 'http://localhost:8000', 
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    },

    // --- 👇 AÑADE ESTAS LÍNEAS ---
    // Esto permite que el servidor sea accesible desde tu red
    host: true, 
    // Esto le dice a Vite que confíe en cualquier URL que termine en '.loca.lt'
    allowedHosts: ['.loca.lt'] 
    // --- 👆 FIN DE LA MODIFICACIÓN ---
  }
})