import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthState, Horario, Product } from "../types";
import { createHorario, getHorarios, getProducts, remarcarHorario } from "../api";

interface ClientePageProps {
  auth: AuthState;
}

export function ClientePage({ auth }: ClientePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [rescheduleValues, setRescheduleValues] = useState<Record<number, string>>({});

  const toDateTimeLocalValue = (isoDateTime: string) => {
    const date = new Date(isoDateTime);
    const timezoneOffsetInMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, h] = await Promise.all([getProducts(auth), getHorarios(auth)]);
      setProducts(p);
      setHorarios(h);
      if (p.length) setSelectedProductId(p[0].id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedProductId) {
      setError("Selecione um produto.");
      return;
    }
    if (!dateTime) {
      setError("Selecione data/hora.");
      return;
    }

    try {
      const iso = new Date(dateTime).toISOString();
      await createHorario(
        {
          usuarioId: auth.userId,
          produtoId: selectedProductId,
          dataHora: iso,
        },
        auth
      );
      setDateTime("");
      toast.success("Agendamento criado com sucesso.");
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar agendamento";
      setError(message);
      toast.error(message);
    }
  };

  const handleRemarcar = async (horario: Horario) => {
    setError(null);

    const selectedDateTime = rescheduleValues[horario.id] ?? toDateTimeLocalValue(horario.dataHora);
    if (!selectedDateTime) {
      setError("Selecione a nova data e hora para remarcar.");
      return;
    }

    try {
      await remarcarHorario(horario.id, new Date(selectedDateTime).toISOString(), auth);
      toast.success("Agendamento remarcado com sucesso.");
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remarcar agendamento";
      setError(message);
      toast.error(message);
    }
  };

  const myHorarios = horarios.filter((h) => h.usuarioId === auth.userId);
  const nextSchedule = myHorarios
    .map((h) => new Date(h.dataHora))
    .filter((d) => d.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <main className="page client-page">
      <section className="client-hero">
        <div>
          <h1>Agendar Servico</h1>
          <p>Escolha seu servico, defina o horario e acompanhe seus agendamentos sem complicacao.</p>
        </div>
        <div className="client-stats">
          <article className="stat-card">
            <span>Servicos</span>
            <strong>{products.length}</strong>
          </article>
          <article className="stat-card">
            <span>Meus agendamentos</span>
            <strong>{myHorarios.length}</strong>
          </article>
          <article className="stat-card">
            <span>Proximo horario</span>
            <strong>{nextSchedule ? nextSchedule.toLocaleDateString() : "-"}</strong>
          </article>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading-chip">Carregando dados...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Novo agendamento</h2>
            <p>Selecione produto e horario para concluir seu pedido.</p>
          </div>

          <form className="form form-grid client-form-grid" onSubmit={handleSubmit}>
            <label>
              Produto
              <select
                value={selectedProductId ?? ""}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nome} - R$ {product.preco.toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Data e hora
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={!products.length}>Agendar</button>
          </form>
        </article>

        <article className="card stack-card">
          <div className="section-header">
            <h2>Meus agendamentos</h2>
            <p>Historico atualizado dos seus horarios agendados.</p>
          </div>

          {myHorarios.length === 0 ? (
            <div className="empty-state">Voce ainda nao possui agendamentos.</div>
          ) : (
            <div className="table-shell">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Produto</th>
                    <th>Data e hora</th>
                    <th>Remarcar</th>
                  </tr>
                </thead>
                <tbody>
                  {myHorarios.map((horario) => (
                    <tr key={horario.id}>
                      <td>{horario.id}</td>
                      <td>{horario.produto?.nome ?? horario.produtoId}</td>
                      <td>{new Date(horario.dataHora).toLocaleString()}</td>
                      <td>
                        <div className="table-action-inline">
                          <input
                            type="datetime-local"
                            value={rescheduleValues[horario.id] ?? toDateTimeLocalValue(horario.dataHora)}
                            onChange={(e) =>
                              setRescheduleValues((prev) => ({
                                ...prev,
                                [horario.id]: e.target.value,
                              }))
                            }
                          />
                          <button type="button" onClick={() => handleRemarcar(horario)}>
                            Remarcar
                          </button>
                        </div>
                      </td>
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

export default ClientePage;
