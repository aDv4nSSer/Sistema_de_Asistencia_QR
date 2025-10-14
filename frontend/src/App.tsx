import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import ProfessorClassesPage from './pages/ProfessorClassesPage'; // <-- Importamos la nueva página
import { useAuthStore } from './store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas con Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}> {/* <-- Envolvemos las rutas con el Layout */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Rutas específicas para el Profesor */}
            <Route element={<ProtectedRoute allowedRoles={['profesor']} />}>
              <Route path="/profesor/clases" element={<ProfessorClassesPage />} />
            </Route>

            {/* Aquí irían las rutas para el Alumno, etc. */}
          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
