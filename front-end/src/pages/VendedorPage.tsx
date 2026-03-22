import { useEffect, useState } from "react";
import { AuthState, Horario, Product, User } from "../types";
import { createHorario, createProduct, getHorarios, getProducts, getUsers } from "../api";

interface VendedorPageProps {
  auth: AuthState;
}

export function VendedorPage({ auth }: VendedorPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);

  const [scheduleUserId, setScheduleUserId] = useState<number>(auth.userId);
  const [scheduleProductId, setScheduleProductId] = useState<number>(0);
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  const totalProducts = products.length;
  const totalSchedules = horarios.length;
  const todaySchedules = horarios.filter((h) => {
    const d = new Date(h.dataHora);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, u, h] = await Promise.all([
        getProducts(auth),
        getUsers(auth),
        getHorarios(auth),
      ]);
      setProducts(p);
      setUsers(u);
      setHorarios(h);
      if (p.length) setScheduleProductId(p[0].id);
      if (u.length) setScheduleUserId(u[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await createProduct({ nome: productName.trim(), preco: productPrice }, auth);
      setProductName("");
      setProductPrice(0);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
    }
  };

  const handleAddHorario = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!scheduleDateTime) {
      setError("Escolha uma data e hora válidas.");
      return;
    }

    try {
      const iso = new Date(scheduleDateTime).toISOString();
      await createHorario(
        {
          usuarioId: scheduleUserId,
          produtoId: scheduleProductId,
          dataHora: iso,
        },
        auth
      );
      setScheduleDateTime("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar horário");
    }
  };

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Painel do Vendedor</h1>
          <p>Gerencie produtos e agendamentos em uma visao rapida e organizada.</p>
        </div>
        <div className="seller-stats">
          <article className="stat-card">
            <span>Produtos</span>
            <strong>{totalProducts}</strong>
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
      {loading && <div className="loading-chip">Carregando dados...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Produtos</h2>
            <p>Cadastre e acompanhe os servicos disponiveis.</p>
          </div>

          <form className="form form-grid" onSubmit={handleAddProduct}>
          <label>
            Nome
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex.: Corte de cabelo"
              required
            />
          </label>
          <label>
            Preço
            <input
              type="number"
              min={0}
              step={0.01}
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
              required
            />
          </label>
            <button type="submit">Adicionar produto</button>
          </form>

          {products.length === 0 ? (
            <div className="empty-state">Nenhum produto cadastrado ainda.</div>
          ) : (
            <div className="table-shell">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.nome}</td>
                      <td>R$ {product.preco.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card stack-card">
          <div className="section-header">
            <h2>Agendamentos</h2>
            <p>Crie novos horarios para seus clientes.</p>
          </div>

          <form className="form form-grid" onSubmit={handleAddHorario}>
          <label>
            Cliente
            <select
              value={scheduleUserId}
              onChange={(e) => setScheduleUserId(Number(e.target.value))}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome} ({user.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Produto
            <select
              value={scheduleProductId}
              onChange={(e) => setScheduleProductId(Number(e.target.value))}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data e hora
            <input
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              required
            />
          </label>
            <button type="submit" disabled={!users.length || !products.length}>
              Criar agendamento
            </button>
          </form>

          {horarios.length === 0 ? (
            <div className="empty-state">Nenhum agendamento encontrado.</div>
          ) : (
            <div className="table-shell">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Data e hora</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.id}>
                      <td>{horario.id}</td>
                      <td>{horario.usuario?.nome ?? horario.usuarioId}</td>
                      <td>{horario.produto?.nome ?? horario.produtoId}</td>
                      <td>{new Date(horario.dataHora).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default VendedorPage;
