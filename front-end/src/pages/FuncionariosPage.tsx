import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthState, User } from "../types";
import { createUser, deleteUser, getUsers, updateUser } from "../api";

interface FuncionariosPageProps {
  auth: AuthState;
}

export function FuncionariosPage({ auth }: FuncionariosPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNome, setEditingNome] = useState("");
  const [editingEmail, setEditingEmail] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await getUsers(auth);
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateFuncionario = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await createUser(
        {
          nome: nome.trim(),
          email: email.trim(),
          senha,
          role: "funcionario",
        },
        auth
      );

      setNome("");
      setEmail("");
      setSenha("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar funcionário");
    }
  };

  const beginEdit = (user: User) => {
    setEditingId(user.id);
    setEditingNome(user.nome);
    setEditingEmail(user.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingNome("");
    setEditingEmail("");
  };

  const handleSaveEdit = async (userId: number) => {
    setError(null);

    try {
      await updateUser(
        userId,
        {
          nome: editingNome.trim(),
          email: editingEmail.trim(),
        },
        auth
      );
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar funcionário");
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(`Excluir o funcionário ${user.nome}?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await deleteUser(user.id, auth);
      if (editingId === user.id) {
        cancelEdit();
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir funcionário");
    }
  };

  const funcionarios = users.filter((u) => u.role === "funcionario" || u.role === "vendedor");

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Funcionários</h1>
          <p>Cadastre e acompanhe os funcionários vinculados à sua loja.</p>
        </div>
        <div className="seller-stats">
          <article className="stat-card">
            <span>Funcionários</span>
            <strong>{funcionarios.length}</strong>
          </article>
          <article className="stat-card">
            <span>Painel</span>
            <strong>
              <Link to="/loja/dashboard">Abrir painel</Link>
            </strong>
          </article>
          <article className="stat-card">
            <span>Atalho</span>
            <strong>
              <Link to="/loja/horarios">Ir para horários</Link>
            </strong>
          </article>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading-chip">Carregando usuários...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Novo funcionário</h2>
            <p>Crie o acesso de equipe com e-mail e senha.</p>
          </div>

          <form className="form form-grid" onSubmit={handleCreateFuncionario}>
            <label>
              Nome
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Maria Souza"
                required
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="funcionario@loja.com"
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Crie uma senha"
                required
              />
            </label>
            <button type="submit">Cadastrar funcionário</button>
          </form>

          {funcionarios.length === 0 ? (
            <div className="empty-state">Nenhum funcionário cadastrado ainda.</div>
          ) : (
            <div className="table-shell">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        {editingId === user.id ? (
                          <input
                            value={editingNome}
                            onChange={(e) => setEditingNome(e.target.value)}
                            aria-label={`Nome do funcionário ${user.id}`}
                          />
                        ) : (
                          user.nome
                        )}
                      </td>
                      <td>
                        {editingId === user.id ? (
                          <input
                            type="email"
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            aria-label={`Email do funcionário ${user.id}`}
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td>{user.role}</td>
                      <td>
                        <div className="table-actions">
                          {editingId === user.id ? (
                            <>
                              <button type="button" onClick={() => handleSaveEdit(user.id)}>
                                Salvar
                              </button>
                              <button type="button" className="action-secondary" onClick={cancelEdit}>
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => beginEdit(user)}>
                                Editar
                              </button>
                              <button
                                type="button"
                                className="action-danger"
                                onClick={() => handleDelete(user)}
                              >
                                Excluir
                              </button>
                            </>
                          )}
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

export default FuncionariosPage;
