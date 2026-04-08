export interface StoreSettings {
  nomeLoja: string;
  telefone: string;
  endereco: string;
  primaryColor: string;
  secondaryFontColor: string;
  logoUrl: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  nomeLoja: "BookingApp",
  telefone: "",
  endereco: "",
  primaryColor: "#0e7490",
  secondaryFontColor: "#5f6f82",
  logoUrl: "",
};

export function normalizeHexColor(input: string): string {
  const value = input.trim();
  const valid = /^#([A-Fa-f0-9]{6})$/.test(value);
  return valid ? value : DEFAULT_STORE_SETTINGS.primaryColor;
}

export function deriveSecondaryColor(hex: string): string {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const darken = (channel: number) => Math.max(0, Math.round(channel * 0.8));
  const toHex = (channel: number) => darken(channel).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgbString(hex: string): string {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
