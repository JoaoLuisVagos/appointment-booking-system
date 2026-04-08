import { Link, useNavigate } from "react-router-dom";
import { AuthState } from "../types";
import { saveAuth } from "../auth";
import { isLojaRole } from "../roles";

interface HeaderProps {
  auth: AuthState | null;
  onLogout: () => void;
}

export function Header({ auth, onLogout }: HeaderProps) {
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
          BookingApp
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
                <Link to="/loja/funcionarios">Funcionários</Link>
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
