import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthState, Horario, Product } from "../types";
import { getHorarios, getProducts } from "../api";

interface DashboardPageProps {
  auth: AuthState;
}

export function DashboardPage({ auth }: DashboardPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const totalSchedules = horarios.length;
  const todaySchedules = horarios.filter((h) => {
    const date = new Date(h.dataHora);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const nextSchedule = horarios
    .map((h) => new Date(h.dataHora))
    .filter((date) => date.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Painel da Loja</h1>
          <p>Visão geral dos seus serviços, horários e acessos rápidos para operação.</p>
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

          <div className="dashboard-links">
            <Link className="dashboard-link-card" to="/loja/cadastros">
              <span>Produtos e cadastro</span>
              <strong>Gerenciar serviços</strong>
            </Link>
            <Link className="dashboard-link-card" to="/loja/funcionarios">
              <span>Equipe da loja</span>
              <strong>Cadastrar funcionários</strong>
            </Link>
            <Link className="dashboard-link-card" to="/loja/horarios">
              <span>Horários cadastrados</span>
              <strong>Ver agenda</strong>
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