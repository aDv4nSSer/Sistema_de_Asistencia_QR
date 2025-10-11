// src/App.tsx

import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    // 1. Inicializa el estado con el token guardado localmente (si existe)
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const handleLogin = (newToken: string) => {
        localStorage.setItem('token', newToken); // Guarda el token
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token
        setToken(null);
    };

    return (
        <div className="App">
            {token ? (
                // 2. Si hay token, carga el Dashboard (la aplicación principal)
                <Dashboard token={token} onLogout={handleLogout} />
            ) : (
                // 3. Si no hay token, muestra el formulario de Login
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;