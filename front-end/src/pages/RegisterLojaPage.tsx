import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthState } from "../types";
import { register } from "../auth";

interface RegisterLojaPageProps {
  onRegister: (auth: AuthState) => void;
}

export function RegisterLojaPage({ onRegister }: RegisterLojaPageProps) {
  const [nomeLoja, setNomeLoja] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [responsavel, setResponsavel] = useState("");
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
      const nomeConta = nomeLoja.trim();
      const auth = await register(nomeConta, email.trim(), senha, "loja");
      onRegister(auth);
      toast.success("Loja cadastrada com sucesso.");
      navigate("/loja");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar loja";
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
          <h1>Cadastro de loja</h1>
          <p>Crie a conta principal da sua loja para organizar produtos, funcionarios e horarios.</p>
          <ul className="auth-points">
            <li>Dados da loja em um fluxo dedicado</li>
            <li>Painel da loja liberado apos cadastro</li>
            <li>Pronto para incluir funcionarios</li>
          </ul>
        </aside>

        <div className="auth-card">
          <div className="auth-headline">
            <span>Conta da loja</span>
            <h2>Registrar Loja</h2>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Nome da loja
              <input
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
                required
                placeholder="Ex.: Barbearia Centro"
              />
            </label>
            <label>
              CNPJ
              <input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
                placeholder="00.000.000/0000-00"
              />
            </label>
            <label>
              Telefone da loja
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Responsavel
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                required
                placeholder="Nome do responsavel"
              />
            </label>
            <label>
              Email de acesso
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="contato@sualoja.com"
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
              {loading ? "Cadastrando..." : "Cadastrar loja"}
            </button>
            <p className="auth-helper-text">
              Clientes devem ser cadastrados pelo link público da loja disponível em Configurações.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterLojaPage;