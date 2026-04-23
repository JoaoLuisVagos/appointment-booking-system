import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthState } from "../types";
import { login } from "../auth";
import { isLojaRole } from "../roles";

interface LoginPageProps {
  onLogin: (auth: AuthState) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = await login(email.trim(), senha);
      onLogin(auth);
      toast.success("Login realizado com sucesso.");
      if (isLojaRole(auth.role)) {
        navigate("/loja");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-shell">
        <aside className="auth-side">
          <h1>Bem-vindo ao BookingApp</h1>
          <p>Organize produtos, horarios e atendimentos com visual claro para sua equipe e seus clientes.</p>
          <ul className="auth-points">
            <li>Gestao simples de agenda</li>
            <li>Painel visual com informacoes rapidas</li>
            <li>Fluxo de atendimento mais profissional</li>
          </ul>
          <div className="auth-side-cta">
            <span>Quer criar uma nova loja?</span>
            <Link to="/register/loja" className="auth-side-cta__button">
              Registrar loja
            </Link>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-headline">
            <span>Acesse sua conta</span>
            <h2>Login</h2>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="seuemail@empresa.com"
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Digite sua senha"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
