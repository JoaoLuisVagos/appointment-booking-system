import { Link, useNavigate } from "react-router-dom";
import { AuthState } from "../types";
import { saveAuth } from "../auth";
import { isLojaOwnerRole, isLojaRole } from "../roles";
import { StoreSettings } from "../storeSettings";

interface HeaderProps {
  auth: AuthState | null;
  onLogout: () => void;
  storeSettings: StoreSettings;
}

export function Header({ auth, onLogout, storeSettings }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    saveAuth(null);
    onLogout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__brand">
        <Link to="/" className="header__logo">
          <span className="header__brand-content">
            {storeSettings.logoUrl ? (
              <img src={storeSettings.logoUrl} alt="Logo da loja" className="header__brand-logo" />
            ) : null}
            <span>{storeSettings.nomeLoja || "BookingApp"}</span>
          </span>
        </Link>
      </div>
      <nav className="header__nav">
        {!auth && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registrar</Link>
            <Link to="/register/loja">Registrar loja</Link>
          </>
        )}
        {auth && (
          <>
            {isLojaRole(auth.role) ? (
              <>
                <Link to="/loja/dashboard">Painel</Link>
                <Link to="/loja/cadastros">Cadastros</Link>
                <Link to="/loja/horarios">Horários</Link>
                {isLojaOwnerRole(auth.role) && <Link to="/loja/funcionarios">Funcionários</Link>}
                {isLojaOwnerRole(auth.role) && <Link to="/loja/configuracoes">Configurações</Link>}
              </>
            ) : (
              <>
                <Link to="/cliente">Agendar</Link>
              </>
            )}
            <button type="button" className="header__logout" onClick={handleLogout}>
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
