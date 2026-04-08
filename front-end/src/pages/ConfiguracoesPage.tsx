import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AuthState } from "../types";
import { updateMinhaLojaSettings } from "../api";
import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
  normalizeHexColor,
} from "../storeSettings";

interface ConfiguracoesPageProps {
  auth: AuthState;
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
}

export function ConfiguracoesPage({ auth, settings, onSettingsChange }: ConfiguracoesPageProps) {
  const [nomeLoja, setNomeLoja] = useState(settings.nomeLoja);
  const [telefone, setTelefone] = useState(settings.telefone);
  const [endereco, setEndereco] = useState(settings.endereco);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);

  useEffect(() => {
    setNomeLoja(settings.nomeLoja);
    setTelefone(settings.telefone);
    setEndereco(settings.endereco);
    setPrimaryColor(settings.primaryColor);
    setLogoUrl(settings.logoUrl);
  }, [settings]);

  const preview = useMemo<StoreSettings>(
    () => ({
      nomeLoja: nomeLoja.trim() || DEFAULT_STORE_SETTINGS.nomeLoja,
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      primaryColor: normalizeHexColor(primaryColor),
      logoUrl: logoUrl.trim(),
    }),
    [nomeLoja, telefone, endereco, primaryColor, logoUrl]
  );

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const saved = await updateMinhaLojaSettings(preview, auth);
      onSettingsChange(saved);
      toast.success("Configurações da loja salvas com sucesso.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configurações da loja";
      toast.error(message);
    }
  };

  const handleReset = async () => {
    try {
      const saved = await updateMinhaLojaSettings(DEFAULT_STORE_SETTINGS, auth);

      setNomeLoja(saved.nomeLoja);
      setTelefone(saved.telefone);
      setEndereco(saved.endereco);
      setPrimaryColor(saved.primaryColor);
      setLogoUrl(saved.logoUrl);

      onSettingsChange(saved);
      toast.success("Configurações restauradas para o padrão.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao restaurar configurações";
      toast.error(message);
    }
  };

  return (
    <main className="page seller-page">
      <section className="seller-hero">
        <div>
          <h1>Configurações da Loja</h1>
          <p>Personalize dados da loja, cor principal e logo exibidos no sistema.</p>
        </div>
      </section>

      <section className="dashboard-grid settings-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>Preferências visuais e dados</h2>
            <p>Se nada for configurado, o sistema mantém automaticamente o padrão.</p>
          </div>

          <form className="form" onSubmit={handleSave}>
            <label>
              Nome da loja
              <input
                value={nomeLoja}
                onChange={(e) => setNomeLoja(e.target.value)}
                placeholder="Ex.: Barbearia Centro"
              />
            </label>
            <label>
              Telefone
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Endereço
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </label>
            <label>
              Cor principal
              <div className="color-field">
                <input
                  type="color"
                  value={normalizeHexColor(primaryColor)}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  aria-label="Selecionar cor principal"
                />
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#0e7490"
                />
              </div>
            </label>
            <label>
              URL da logo
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
              />
            </label>

            <div className="settings-actions">
              <button type="submit">Salvar configurações</button>
              <button type="button" className="action-secondary" onClick={handleReset}>
                Restaurar padrão
              </button>
            </div>
          </form>
        </article>

        <article className="card stack-card">
          <div className="section-header">
            <h2>Pré-visualização</h2>
            <p>Como o cabeçalho da loja aparecerá para a equipe.</p>
          </div>

          <div className="settings-preview" style={{ borderColor: preview.primaryColor }}>
            <div className="settings-preview__brand" style={{ color: preview.primaryColor }}>
              {preview.logoUrl ? (
                <img src={preview.logoUrl} alt="Logo da loja" />
              ) : (
                <div className="settings-preview__logo-placeholder">Sem logo</div>
              )}
              <strong>{preview.nomeLoja}</strong>
            </div>
            <p>{preview.telefone || "Telefone não informado"}</p>
            <p>{preview.endereco || "Endereço não informado"}</p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default ConfiguracoesPage;
