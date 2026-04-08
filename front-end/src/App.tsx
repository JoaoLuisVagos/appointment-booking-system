import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import FuncionariosPage from './pages/FuncionariosPage';
import ClientePage from './pages/ClientePage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import { isLojaRole } from './roles';
import { getMinhaLojaSettings } from './api';
import {
  DEFAULT_STORE_SETTINGS,
  deriveSecondaryColor,
  StoreSettings,
} from './storeSettings';

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    const savedAuth = loadAuth();
    setAuth(savedAuth);
  }, []);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      if (!auth || !auth.lojaId) {
        if (active) {
          setStoreSettings(DEFAULT_STORE_SETTINGS);
        }
        return;
      }

      try {
        const settings = await getMinhaLojaSettings(auth);
        if (active) {
          setStoreSettings(settings);
        }
      } catch {
        if (active) {
          setStoreSettings(DEFAULT_STORE_SETTINGS);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, [auth]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', storeSettings.primaryColor);
    root.style.setProperty('--primary-2', deriveSecondaryColor(storeSettings.primaryColor));
  }, [storeSettings]);

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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              border: '1px solid #d3e2f0',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#1a2b3f',
            },
          }}
        />
        <Header auth={auth} onLogout={handleLogout} storeSettings={storeSettings} />
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
            path="/loja/funcionarios"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['loja']}>
                {auth && <FuncionariosPage auth={auth} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['loja', 'funcionario', 'vendedor', 'cliente']}>
                {auth && (
                  <ConfiguracoesPage
                    auth={auth}
                    settings={storeSettings}
                    onSettingsChange={setStoreSettings}
                  />
                )}
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
