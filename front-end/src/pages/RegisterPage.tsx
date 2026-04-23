import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthState } from "../types";
import { register } from "../auth";
import { isLojaRole } from "../roles";

interface RegisterPageProps {
  onRegister: (auth: AuthState) => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const { lojaId: lojaIdParam } = useParams<{ lojaId?: string }>();
  const lojaId = lojaIdParam ? Number(lojaIdParam) : undefined;
  const hasLojaInvite = Number.isFinite(lojaId) && (lojaId ?? 0) > 0;

  const [nome, setNome] = useState("");
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
      const auth = await register(
        nome.trim(),
        email.trim(),
        senha,
        "cliente",
        hasLojaInvite ? lojaId : undefined
      );
      onRegister(auth);
      toast.success(hasLojaInvite ? "Cadastro concluído e cliente vinculado à loja." : "Conta criada com sucesso.");
      if (isLojaRole(auth.role)) {
        navigate("/loja");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasLojaInvite) {
    return (
      <div className="page auth-page">
        <div className="auth-shell">
          <aside className="auth-side">
            <h1>Cadastro de cliente por convite</h1>
            <p>
              O cadastro público foi desativado. Clientes entram apenas pelo link compartilhado pela
              loja nas configurações.
            </p>
            <ul className="auth-points">
              <li>Cadastro vinculado à loja correta</li>
              <li>Mais controle para a operação</li>
              <li>Link disponível no painel da loja</li>
            </ul>
          </aside>

          <div className="auth-card">
            <div className="auth-headline">
              <span>Acesso restrito</span>
              <h2>Use o link da loja</h2>
            </div>

            <div className="auth-locked-box">
              <p>
                Para criar uma conta de cliente, use o link público gerado na tela de configurações da
                loja.
              </p>
              <Link className="auth-locked-link" to="/login">
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <div className="auth-shell">
        <aside className="auth-side">
          <h1>Crie sua conta em minutos</h1>
          <p>
            {hasLojaInvite
              ? "Você foi convidado por uma loja. Complete seu cadastro para já entrar com vínculo correto."
              : "Comece agora com um painel moderno para vendas e agendamentos, com tudo em um unico lugar."}
          </p>
          <ul className="auth-points">
            <li>Cadastro rapido e intuitivo</li>
            <li>{hasLojaInvite ? "Cadastro já vinculado à loja" : "Cadastro direto para clientes"}</li>
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
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
            <p className="auth-helper-text">
              Funcionários devem ser criados pela loja no painel. Clientes entram apenas pelo link de convite da loja.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
