export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Every user-facing string lives in a Localized<T> record — never hardcoded in components. */
export type Localized<T> = Record<Locale, T>;

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = "EUR",
  maximumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
}

export function formatPercent(rate: number, locale: Locale, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "percent",
    maximumFractionDigits,
  }).format(rate);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso + (iso.length === 10 ? "T12:00:00" : "")));
}
