import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthState } from './types';
import { loadAuth, saveAuth } from './auth';
import Header from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterLojaPage from './pages/RegisterLojaPage';
import DashboardPage from './pages/DashboardPage';
import CadastrosPage from './pages/CadastrosPage';
import HorariosPage from './pages/HorariosPage';
import ClientePage from './pages/ClientePage';
import { isLojaRole } from './roles';

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
                <Navigate to={isLojaRole(auth.role) ? '/loja/dashboard' : '/cliente'} replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              auth ? (
                <Navigate to={isLojaRole(auth.role) ? '/loja/dashboard' : '/cliente'} replace />
              ) : (
                <RegisterPage onRegister={handleLogin} />
              )
            }
          />
          <Route
            path="/register/loja"
            element={
              auth ? (
                <Navigate to={isLojaRole(auth.role) ? '/loja/dashboard' : '/cliente'} replace />
              ) : (
                <RegisterLojaPage onRegister={handleLogin} />
              )
            }
          />
          <Route
            path="/loja/dashboard"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['loja', 'funcionario', 'vendedor']}>
                {auth && <DashboardPage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja/cadastros"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['loja', 'funcionario', 'vendedor']}>
                {auth && <CadastrosPage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/loja/horarios"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['loja', 'funcionario', 'vendedor']}>
                {auth && <HorariosPage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendedor/*"
            element={<Navigate to="/loja/dashboard" replace />}
          />
          <Route
            path="/loja"
            element={<Navigate to="/loja/dashboard" replace />}
          />
          <Route
            path="/cliente"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['cliente']}>
                {auth && <ClientePage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={auth ? (isLojaRole(auth.role) ? '/loja/dashboard' : '/cliente') : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
