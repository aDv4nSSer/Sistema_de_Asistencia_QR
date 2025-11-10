// src/components/admin/UserManagement.tsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Fab, Tooltip, IconButton, Chip, Switch, Divider
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/usuarios/');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <BulkUserUploader onSuccess={fetchUsers} />
      
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2">Usuarios Individuales</Typography>
      </Divider>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">Activo</TableCell>
              {/* --- 👇 CORRECCIÓN AQUÍ --- */}
              <TableCell align="right">Acciones</TableCell>
              {/* --- 👆 FIN DE LA CORRECCIÓN --- */}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay usuarios creados.
                </TableCell>
              </TableRow>
            )}
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