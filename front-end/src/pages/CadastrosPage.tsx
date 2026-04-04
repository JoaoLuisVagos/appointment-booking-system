import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthState, Product } from "../types";
import { createProduct, getProducts } from "../api";

interface CadastrosPageProps {
  auth: AuthState;
}

export function CadastrosPage({ auth }: CadastrosPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await getProducts(auth);
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await createProduct({ nome: productName.trim(), preco: productPrice }, auth);
      setProductName("");
      setProductPrice(0);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
    }
  };

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Cadastros</h1>
          <p>Cadastre os serviços disponíveis e mantenha o catálogo sempre atualizado.</p>
        </div>
        <div className="seller-stats">
          <article className="stat-card">
            <span>Produtos</span>
            <strong>{products.length}</strong>
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
      {loading && <div className="loading-chip">Carregando produtos...</div>}

      <section className="dashboard-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Novo produto</h2>
            <p>Adicione os itens que ficarão disponíveis para agendamento.</p>
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
      </section>
    </main>
  );
}

export default CadastrosPage;