import type { Lang } from "./i18n";

const locale = (lang: Lang) => (lang === "es" ? "es-US" : "en-US");

export function money(value: number, lang: Lang = "en", opts: { cents?: boolean } = {}) {
  const cents = opts.cents ?? true;
  return new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value);
}

export function hours(value: number, lang: Lang = "en") {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 2 }).format(value);
}

/** "08:00" → "8 AM" / "8:30 PM". */
export function clockLabel(value: string, short = false) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h < 12 ? (short ? "a" : " AM") : short ? "p" : " PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}
