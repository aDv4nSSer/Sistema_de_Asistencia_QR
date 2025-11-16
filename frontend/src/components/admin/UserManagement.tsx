// src/components/admin/UserManagement.tsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Fab, Tooltip, IconButton, Chip, Switch, Divider,
  // --- 👇 AÑADIDO: Imports para el filtro ---
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import apiClient from '../../services/apiClient';
import CreateUserModal from './CreateUserModal';
import BulkUserUploader from './BulkUserUploader';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // --- 👇 AÑADIDO: Estado para el filtro ---
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // --- 👇 MODIFICADO: fetchUsers ahora usa el filtro ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepara los parámetros de la API
      const params = new URLSearchParams();
      if (roleFilter !== 'todos') {
        params.append('rol', roleFilter);
      }
      
      // Añade los parámetros a la petición
      const response = await apiClient.get(`/usuarios/?${params.toString()}`);
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  // --- 👇 MODIFICADO: useEffect ahora depende de 'roleFilter' ---
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]); // Se ejecutará de nuevo cada vez que 'roleFilter' cambie

  // --- 👇 AÑADIDO: Manejador para el cambio del filtro ---
  const handleFilterChange = (event: any) => { // Puedes usar 'SelectChangeEvent' si importas
    setRoleFilter(event.target.value as string);
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      const newActiveState = !usuario.activo;
      await apiClient.put(`/usuarios/${usuario.id}`, { activo: newActiveState });
      
      setUsers(users.map(u => 
        u.id === usuario.id ? { ...u, activo: newActiveState } : u
      ));
    } catch (err) {
      console.error("Error al cambiar estado", err);
      setError("No se pudo actualizar el estado del usuario.");
    }
  };

  const getRolChipColor = (rol: string) => {
    if (rol === 'ti') return "error";
    if (rol === 'administrador') return "warning";
    if (rol === 'profesor') return "primary";
    return "default";
  };

  return (
    <Box>
      <BulkUserUploader onSuccess={fetchUsers} />
      
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2">Usuarios Individuales</Typography>
      </Divider>

      {/* --- 👇 AÑADIDO: Interfaz del Filtro --- */}
      <Box sx={{ mb: 2, maxWidth: 300 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="role-filter-label">Filtrar por Rol</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter}
            label="Filtrar por Rol"
            onChange={handleFilterChange}
          >
            <MenuItem value="todos">Todos los Roles</MenuItem>
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="profesor">Profesor</MenuItem>
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="ti">TI</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* --- 👇 MODIFICADO: Mensaje si no hay usuarios CON el filtro --- */}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {roleFilter === 'todos' 
                      ? 'No hay usuarios creados.' 
                      : `No se encontraron usuarios con el rol '${roleFilter}'.`
                    }
                  </TableCell>
                </TableRow>
              )}
              {/* --- 👆 FIN DE LA MODIFICACIÓN --- */}

              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.nombre}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.rol} color={getRolChipColor(user.rol)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.activo ? "Desactivar" : "Activar"}>
                      <Switch
                        checked={user.activo}
                        onChange={() => handleToggleActive(user)}
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar (Próximamente)">
                      <span>
                        <IconButton disabled>
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </Box>
  );
};

export default UserManagement;