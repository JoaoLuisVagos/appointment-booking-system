import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import { getLojaPublicaSettings, getMinhaLojaSettings } from './api';
import {
  DEFAULT_STORE_SETTINGS,
  deriveSecondaryColor,
  hexToRgbString,
  StoreSettings,
} from './storeSettings';

const DEFAULT_TAB_TITLE = 'BookingApp - Sistema de Agendamento';
const DEFAULT_FAVICON = '/vite.svg';

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const location = useLocation();

  const inviteLojaId = useMemo(() => {
    const match = location.pathname.match(/^\/cadastro_cliente\/(\d+)$/);
    if (!match) {
      return null;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [location.pathname]);

  useEffect(() => {
    const savedAuth = loadAuth();
    setAuth(savedAuth);
  }, []);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      if (auth?.lojaId) {
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
        return;
      }

      if (inviteLojaId) {
        try {
          const settings = await getLojaPublicaSettings(inviteLojaId);
          if (active) {
            setStoreSettings(settings);
          }
        } catch {
          if (active) {
            setStoreSettings(DEFAULT_STORE_SETTINGS);
          }
        }
        return;
      }

      if (active) {
        setStoreSettings(DEFAULT_STORE_SETTINGS);
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, [auth, inviteLojaId]);

  useEffect(() => {
    const root = document.documentElement;
    const primary = storeSettings.primaryColor;
    const primary2 = deriveSecondaryColor(primary);

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-2', primary2);
    root.style.setProperty('--primary-rgb', hexToRgbString(primary));
    root.style.setProperty('--primary-2-rgb', hexToRgbString(primary2));
    root.style.setProperty('--secondary-font', storeSettings.secondaryFontColor);
  }, [storeSettings]);

  useEffect(() => {
    const nomeLoja = storeSettings.nomeLoja?.trim();
    document.title = nomeLoja ? `${nomeLoja} - Sistema de Agendamento` : DEFAULT_TAB_TITLE;

    const iconHref = storeSettings.logoUrl?.trim() || DEFAULT_FAVICON;
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (favicon) {
      favicon.href = iconHref;
      return;
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = iconHref;
    document.head.appendChild(link);
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
          path="/cadastro_cliente/:lojaId"
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
        <Route path="/vendedor/*" element={<Navigate to="/loja/dashboard" replace />} />
        <Route path="/loja" element={<Navigate to="/loja/dashboard" replace />} />
        <Route
          path="/cliente"
          element={
            <ProtectedRoute auth={auth} allowedRoles={['cliente']}>
              {auth && <ClientePage auth={auth} />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={auth ? (isLojaRole(auth.role) ? '/loja/dashboard' : '/cliente') : '/login'} replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
