import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthState } from "../types";
import { login } from "../auth";

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
      if (auth.role === "vendedor") {
        navigate("/vendedor");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
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
