import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthState, Horario, Product, User } from "../types";
import { createHorario, getHorarios, getProducts, getUsers, remarcarHorario } from "../api";
import { isLojaRole } from "../roles";

interface HorariosPageProps {
  auth: AuthState;
}

export function HorariosPage({ auth }: HorariosPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [scheduleUserId, setScheduleUserId] = useState<number>(auth.userId);
  const [scheduleProductId, setScheduleProductId] = useState<number>(0);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [rescheduleValues, setRescheduleValues] = useState<Record<number, string>>({});

  const toDateTimeLocalValue = (isoDateTime: string) => {
    const date = new Date(isoDateTime);
    const timezoneOffsetInMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16);
  };

  const funcionarios = users.filter((user) => isLojaRole(user.role));

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
      const usersFromStore = u.filter((user) => isLojaRole(user.role));

      setProducts(p);
      setUsers(u);
      setHorarios(h);
      if (p.length) setScheduleProductId(p[0].id);
      if (usersFromStore.length > 0) {
        setScheduleUserId(usersFromStore[0].id);
      } else if (u.length) {
        setScheduleUserId(u[0].id);
      }
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

  const handleRemarcar = async (horario: Horario) => {
    setError(null);

    const selectedDateTime = rescheduleValues[horario.id] ?? toDateTimeLocalValue(horario.dataHora);
    if (!selectedDateTime) {
      setError("Escolha uma nova data e hora válidas.");
      return;
    }

    try {
      await remarcarHorario(horario.id, new Date(selectedDateTime).toISOString(), auth);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remarcar horário");
    }
  };

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Horários</h1>
          <p>Crie e acompanhe os agendamentos em uma tela dedicada.</p>
        </div>
        <div className="seller-stats">
          <article className="stat-card">
            <span>Agendamentos</span>
            <strong>{totalSchedules}</strong>
          </article>
          <article className="stat-card">
            <span>Hoje</span>
            <strong>{todaySchedules}</strong>
          </article>
          <article className="stat-card">
            <span>Painel</span>
            <strong>
              <Link to="/loja/dashboard">Abrir painel</Link>
            </strong>
          </article>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading-chip">Carregando horários...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Novo agendamento</h2>
            <p>Associe cliente, produto e horário para registrar um atendimento.</p>
          </div>

          <form className="form form-grid" onSubmit={handleAddHorario}>
            <label>
              Funcionário
              <select
                value={scheduleUserId}
                onChange={(e) => setScheduleUserId(Number(e.target.value))}
              >
                {(funcionarios.length ? funcionarios : users).map((user) => (
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
                    <th>Funcionário</th>
                    <th>Produto</th>
                    <th>Data e hora</th>
                    <th>Remarcar</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario.id}>
                      <td>{horario.id}</td>
                      <td>{horario.usuario?.nome ?? horario.usuarioId}</td>
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

export default HorariosPage;