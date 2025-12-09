import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import StudentScannerPage from './pages/StudentScannerPage';
import StudentHistoryPage from './pages/StudentHistoryPage';
import { useAuthStore } from './store/authStore';

// --- Archivos renombrados y nuevos ---
import ProfessorAsignaturasPage from './pages/ProfessorAsignaturasPage';
import ProfessorHistoryPage from './pages/ProfessorHistoryPage'; 
import ProfessorAttendancePage from './pages/ProfessorAttendancePage';
import StudentAsignaturasPage from './pages/StudentAsignaturasPage';
import AdminPage from './pages/AdminPage';
import AdminAsignaturaDetailPage from './pages/AdminAsignaturaDetailPage';

// --- 1. IMPORTA EL NUEVO COMPONENTE ---
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      {/* --- 2. AÑADE EL COMPONENTE AQUÍ --- */}
      {/* Debe estar dentro de BrowserRouter para que funcione */}
      <ScrollToTop />
      
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas con Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* --- Rutas de Profesor (MODIFICADO) --- */}
            <Route element={<ProtectedRoute allowedRoles={['profesor']} />}>
              <Route path="/profesor/asignaturas" element={<ProfessorAsignaturasPage />} />
              <Route path="/profesor/historial" element={<ProfessorHistoryPage />} />
              <Route path="/profesor/sesion/:sesionId/asistencia" element={<ProfessorAttendancePage/>} />
            </Route>

            {/* --- Rutas de Estudiante (MODIFICADO) --- */}
            <Route element={<ProtectedRoute allowedRoles={['estudiante']} />}>
              <Route path="/estudiante/asignaturas" element={<StudentAsignaturasPage />} /> 
              <Route path="/estudiante/asistencia" element={<StudentScannerPage />} />
              <Route path="/estudiante/historial" element={<StudentHistoryPage />} />
            </Route>
            
            {/* --- Rutas de Admin/TI (MODIFICADO) --- */}
            <Route element={<ProtectedRoute allowedRoles={['administrador', 'ti']} />}>
              <Route path="/admin/gestion" element={<AdminPage />} />
              <Route path="/admin/asignatura/:asignaturaId/alumnos" element={<AdminAsignaturaDetailPage />} />
            </Route>

          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
