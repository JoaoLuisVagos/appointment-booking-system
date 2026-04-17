import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AuthState } from "../types";
import { getMeuPerfilCliente, updateMinhaLojaSettings, updateMeuPerfilCliente } from "../api";
import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
  normalizeHexColor,
} from "../storeSettings";
import { isLojaOwnerRole } from "../roles";

interface ConfiguracoesPageProps {
  auth: AuthState;
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
}

export function ConfiguracoesPage({ auth, settings, onSettingsChange }: ConfiguracoesPageProps) {
  const isLoja = isLojaOwnerRole(auth.role);
  const cadastroClienteLink = isLoja && auth.lojaId
    ? `${window.location.origin}/cadastro_cliente/${auth.lojaId}`
    : "";

  const [nomeLoja, setNomeLoja] = useState(settings.nomeLoja);
  const [telefone, setTelefone] = useState(settings.telefone);
  const [endereco, setEndereco] = useState(settings.endereco);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryFontColor, setSecondaryFontColor] = useState(settings.secondaryFontColor);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [complemento, setComplemento] = useState("");
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);

  useEffect(() => {
    setNomeLoja(settings.nomeLoja);
    setTelefone(settings.telefone);
    setEndereco(settings.endereco);
    setPrimaryColor(settings.primaryColor);
    setSecondaryFontColor(settings.secondaryFontColor);
    setLogoUrl(settings.logoUrl);
  }, [settings]);

  useEffect(() => {
    let active = true;

    const loadPerfil = async () => {
      if (isLoja) {
        return;
      }

      setLoadingPerfil(true);
      try {
        const perfil = await getMeuPerfilCliente(auth);
        if (!active) {
          return;
        }

        setTelefone(perfil.telefone || "");
        setEndereco(perfil.endereco || "");
        setCidade(perfil.cidade || "");
        setEstado(perfil.estado || "");
        setCep(perfil.cep || "");
        setComplemento(perfil.complemento || "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar configurações de perfil";
        toast.error(message);
      } finally {
        if (active) {
          setLoadingPerfil(false);
        }
      }
    };

    loadPerfil();

    return () => {
      active = false;
    };
  }, [auth, isLoja]);

  const preview = useMemo<StoreSettings>(
    () => ({
      nomeLoja: nomeLoja.trim() || DEFAULT_STORE_SETTINGS.nomeLoja,
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      primaryColor: normalizeHexColor(primaryColor),
      secondaryFontColor: normalizeHexColor(secondaryFontColor),
      logoUrl: logoUrl.trim(),
    }),
    [nomeLoja, telefone, endereco, primaryColor, secondaryFontColor, logoUrl]
  );

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoja) {
      try {
        const saved = await updateMinhaLojaSettings(preview, auth);
        onSettingsChange(saved);
        toast.success("Configurações da loja salvas com sucesso.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao salvar configurações da loja";
        toast.error(message);
      }
      return;
    }

    setSavingPerfil(true);
    try {
      await updateMeuPerfilCliente(
        {
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          complemento,
        },
        auth
      );
      toast.success("Dados do perfil salvos com sucesso.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar dados do perfil";
      toast.error(message);
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleReset = async () => {
    if (!isLoja) {
      return;
    }

    try {
      const saved = await updateMinhaLojaSettings(DEFAULT_STORE_SETTINGS, auth);

      setNomeLoja(saved.nomeLoja);
      setTelefone(saved.telefone);
      setEndereco(saved.endereco);
      setPrimaryColor(saved.primaryColor);
      setSecondaryFontColor(saved.secondaryFontColor);
      setLogoUrl(saved.logoUrl);

      onSettingsChange(saved);
      toast.success("Configurações restauradas para o padrão.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao restaurar configurações";
      toast.error(message);
    }
  };

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

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    const maxBytes = 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("A imagem deve ter no máximo 1MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        toast.error("Não foi possível ler a imagem selecionada.");
        return;
      }
      setLogoUrl(result);
      toast.success("Imagem da logo carregada.");
    };
    reader.onerror = () => {
      toast.error("Falha ao processar o arquivo de imagem.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="page seller-page">
      <section className={isLoja ? "seller-hero" : "client-hero"}>
        <div>
          <h1>Configurações</h1>
          <p>
            {isLoja
              ? "Personalize dados da loja, cor principal e logo exibidos no sistema."
              : "Atualize seus dados importantes de contato e endereço."}
          </p>
        </div>
      </section>

      {loadingPerfil && !isLoja && <div className="loading-chip">Carregando dados do perfil...</div>}

      <section className="dashboard-grid settings-grid">
        <article className="card stack-card">
          <div className="section-header">
            <h2>{isLoja ? "Preferências visuais e dados" : "Dados pessoais"}</h2>
            <p>
              {isLoja
                ? "Se nada for configurado, o sistema mantém automaticamente o padrão."
                : "Esses campos aparecem apenas na tela de configurações."}
            </p>
          </div>

          <form className="form" onSubmit={handleSave}>
            {isLoja ? (
              <>
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
                  Cor secundária de fonte
                  <div className="color-field">
                    <input
                      type="color"
                      value={normalizeHexColor(secondaryFontColor)}
                      onChange={(e) => setSecondaryFontColor(e.target.value)}
                      aria-label="Selecionar cor secundária de fonte"
                    />
                    <input
                      value={secondaryFontColor}
                      onChange={(e) => setSecondaryFontColor(e.target.value)}
                      placeholder="#5f6f82"
                    />
                  </div>
                </label>
                <label>
                  Logo da loja
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                  />
                </label>
                {logoUrl && (
                  <button type="button" className="action-secondary" onClick={() => setLogoUrl("")}>
                    Remover logo
                  </button>
                )}

                <div className="settings-actions">
                  <button type="submit">Salvar configurações</button>
                  <button type="button" className="action-secondary" onClick={handleReset}>
                    Restaurar padrão
                  </button>
                </div>

                <div className="invite-link-box">
                  <label>
                    Link público para cadastro de clientes da sua loja
                    <input value={cadastroClienteLink} readOnly />
                  </label>
                  <button type="button" className="action-secondary" onClick={handleCopyCadastroLink}>
                    Copiar link
                  </button>
                </div>
              </>
            ) : (
              <>
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
                  Cidade
                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex.: São Paulo"
                  />
                </label>
                <label>
                  Estado
                  <input
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="Ex.: SP"
                  />
                </label>
                <label>
                  CEP
                  <input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                  />
                </label>
                <label>
                  Complemento
                  <input
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apartamento, referência, etc"
                  />
                </label>

                <button type="submit" disabled={savingPerfil}>
                  {savingPerfil ? "Salvando..." : "Salvar dados"}
                </button>
              </>
            )}
          </form>
        </article>

        {isLoja && (
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
              <p style={{ color: preview.secondaryFontColor }}>{preview.telefone || "Telefone não informado"}</p>
              <p style={{ color: preview.secondaryFontColor }}>{preview.endereco || "Endereço não informado"}</p>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

export default ConfiguracoesPage;
