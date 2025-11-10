// src/components/admin/BulkUserUploader.tsx
import { useState } from 'react';
import { Box, Button, Alert, Typography, CircularProgress, Stack, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse'; // Importamos PapaParse
import apiClient from '../../services/apiClient';

interface Props {
  onSuccess: () => void; // Función para recargar la tabla de usuarios
}

const BulkUserUploader = ({ onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Usamos PapaParse para leer el archivo CSV
    Papa.parse(file, {
      header: true, // Asume que la primera fila es el encabezado
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        
        // 1. Validar y transformar los datos del CSV
        const usuariosParaCrear = [];
        for (const row of data) {
          // Asegurarnos que las columnas existan y tengan el nombre correcto
          if (!row.email || !row.nombre || !row.contrasena || !row.rol) {
            setError(`Error en el archivo CSV: Una fila no tiene 'email', 'nombre', 'contrasena' o 'rol'.`);
            setLoading(false);
            return;
          }
          // El backend espera 'contraseña'
          usuariosParaCrear.push({
            nombre: row.nombre,
            email: row.email,
            contrasena: row.contrasena,
            rol: row.rol.toLowerCase(), // Aseguramos minúsculas
            activo: true,
          });
        }

        // 2. Enviar al backend
        try {
          const response = await apiClient.post(
            '/usuarios/bulk', 
            { usuarios: usuariosParaCrear }
          );
          
          const { exitosos, fallidos, detalles_fallidos } = response.data;
          
          if (fallidos > 0) {
            setSuccess(`Proceso completado: ${exitosos} usuarios creados.`);
            setError(`Fallaron ${fallidos} usuarios. Errores: ${detalles_fallidos.join(', ')}`);
          } else {
            setSuccess(`¡Éxito! Se crearon ${exitosos} nuevos usuarios.`);
          }
          onSuccess(); // Recargamos la tabla de usuarios en la página padre
          
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Error al enviar los datos al servidor.');
        } finally {
          setLoading(false);
        }
      },
      error: (err: any) => {
        setError(`Error al leer el archivo CSV: ${err.message}`);
        setLoading(false);
      }
    });

    // Resetear el input para permitir subir el mismo archivo de nuevo
    event.target.value = '';
  };

  return (
    <Paper sx={{ p: 2, mb: 3, border: '2px dashed', borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Carga Masiva de Usuarios (CSV)</Typography>
        <Typography variant="body2" color="text.secondary">
          Sube un archivo `.csv` con las columnas: `nombre`, `email`, `contrasena`, `rol`.
          (Roles permitidos: estudiante, profesor, administrador, ti)
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Button
            variant="contained"
            component="label" // Esto convierte el botón en un <label> para el input
            startIcon={<UploadFileIcon />}
            disabled={loading}
          >
            Seleccionar Archivo CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>
        )}
        
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        
      </Stack>
    </Paper>
  );
};

export default BulkUserUploader;