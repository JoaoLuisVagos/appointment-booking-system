import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthState } from './types';
import { loadAuth, saveAuth } from './auth';
import Header from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendedorPage from './pages/VendedorPage';
import ClientePage from './pages/ClientePage';

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const savedAuth = loadAuth();
    setAuth(savedAuth);
  }, []);

  const handleLogin = (authData: AuthState) => {
    setAuth(authData);
    saveAuth(authData);
  };

  const handleLogout = () => {
    setAuth(null);
    saveAuth(null);
  };

  return (
    <div className="app">
      <BrowserRouter>
        <Header auth={auth} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/login"
            element={
              auth ? (
                <Navigate to={auth.role === 'vendedor' ? '/vendedor' : '/cliente'} replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              auth ? (
                <Navigate to={auth.role === 'vendedor' ? '/vendedor' : '/cliente'} replace />
              ) : (
                <RegisterPage onRegister={handleLogin} />
              )
            }
          />
          <Route
            path="/vendedor"
            element={
              <ProtectedRoute auth={auth} requiredRole="vendedor">
                {auth && <VendedorPage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/cliente"
            element={
              <ProtectedRoute auth={auth} requiredRole="cliente">
                {auth && <ClientePage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={auth ? (auth.role === 'vendedor' ? '/vendedor' : '/cliente') : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
