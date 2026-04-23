import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthState, Horario, Product } from "../types";
import { getHorarios, getProducts } from "../api";
import { isFuncionarioRole, isLojaOwnerRole } from "../roles";

interface DashboardPageProps {
  auth: AuthState;
}

export function DashboardPage({ auth }: DashboardPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cadastroClienteLink = isLojaOwnerRole(auth.role) && auth.lojaId
    ? `${window.location.origin}/cadastro_cliente/${auth.lojaId}`
    : "";

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const [p, h] = await Promise.all([getProducts(auth), getHorarios(auth)]);
      setProducts(p);
      setHorarios(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFuncionario = isFuncionarioRole(auth.role);
  const isLojaOwner = isLojaOwnerRole(auth.role);
  const scopedHorarios = isFuncionario
    ? horarios.filter((h) => h.usuarioId === auth.userId)
    : horarios;

  const totalSchedules = scopedHorarios.length;
  const todaySchedules = scopedHorarios.filter((h) => {
    const date = new Date(h.dataHora);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const nextSchedule = scopedHorarios
    .map((h) => new Date(h.dataHora))
    .filter((date) => date.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const handleCopyCadastroLink = async () => {
    if (!cadastroClienteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(cadastroClienteLink);
      toast.success("Link de cadastro copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>{isFuncionario ? "Meu Painel" : "Painel da Loja"}</h1>
          <p>
            {isFuncionario
              ? "Acompanhe somente seus horários e seus próximos atendimentos."
              : "Visão geral dos seus serviços, horários e acessos rápidos para operação."}
          </p>
        </div>
        <div className="seller-stats">
          <article className="stat-card">
            <span>Produtos</span>
            <strong>{products.length}</strong>
          </article>
          <article className="stat-card">
            <span>Agendamentos</span>
            <strong>{totalSchedules}</strong>
          </article>
          <article className="stat-card">
            <span>Hoje</span>
            <strong>{todaySchedules}</strong>
          </article>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading-chip">Carregando painel...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Atalhos</h2>
            <p>Abra rapidamente a tela de produtos, horários ou consulte o próximo compromisso.</p>
          </div>

          {cadastroClienteLink && (
            <div className="invite-link-box invite-link-box--dashboard">
              <div>
                <span className="invite-link-label">Cadastro de clientes</span>
                <strong>Compartilhe este link com seus clientes</strong>
                <p>
                  O acesso público para clientes fica concentrado aqui para evitar cadastros fora da sua loja.
                </p>
              </div>
              <div className="invite-link-box__actions">
                <input value={cadastroClienteLink} readOnly />
                <button type="button" className="copy-link-button" onClick={handleCopyCadastroLink}>
                  Copiar link
                </button>
              </div>
            </div>
          )}

          <div className="dashboard-links">
            {!isFuncionario && (
              <Link className="dashboard-link-card" to="/loja/cadastros">
                <span>Produtos e cadastro</span>
                <strong>Gerenciar serviços</strong>
              </Link>
            )}
            {isLojaOwner && (
              <Link className="dashboard-link-card" to="/loja/funcionarios">
                <span>Equipe da loja</span>
                <strong>Cadastrar funcionários</strong>
              </Link>
            )}
            {isLojaOwner && (
              <Link className="dashboard-link-card" to="/configuracoes">
                <span>Personalização</span>
                <strong>Configurar loja</strong>
              </Link>
            )}
            <Link className="dashboard-link-card" to="/loja/horarios">
              <span>{isFuncionario ? "Meus horários" : "Horários cadastrados"}</span>
              <strong>{isFuncionario ? "Ver meus atendimentos" : "Ver agenda"}</strong>
            </Link>
            <div className="dashboard-link-card dashboard-link-card--static">
              <span>Próximo horário</span>
              <strong>{nextSchedule ? nextSchedule.toLocaleString() : "-"}</strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default DashboardPage;