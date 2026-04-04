import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthState, UserRole } from "../types";
import { register } from "../auth";
import { isLojaRole } from "../roles";

interface RegisterPageProps {
  onRegister: (auth: AuthState) => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<UserRole>("cliente");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = await register(nome.trim(), email.trim(), senha, role);
      onRegister(auth);
      if (isLojaRole(auth.role)) {
        navigate("/loja");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-shell">
        <aside className="auth-side">
          <h1>Crie sua conta em minutos</h1>
          <p>Comece agora com um painel moderno para vendas e agendamentos, com tudo em um unico lugar.</p>
          <ul className="auth-points">
            <li>Cadastro rapido e intuitivo</li>
            <li>Perfis de cliente e funcionario</li>
            <li>Pronto para atender melhor</li>
          </ul>
        </aside>

        <div className="auth-card">
          <div className="auth-headline">
            <span>Novo acesso</span>
            <h2>Registrar</h2>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Nome
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Seu nome completo"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                placeholder="Crie uma senha segura"
              />
            </label>
            <label>
              Tipo de usuario
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="cliente">Cliente</option>
                <option value="funcionario">Funcionario</option>
              </select>
            </label>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
            <p className="auth-helper-text">
              Quer cadastrar uma loja? <Link to="/register/loja">Use o cadastro de loja</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
