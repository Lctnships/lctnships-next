import type { Locale } from "@/i18n/config"

/**
 * Map next-intl locale codes to the BCP 47 tags Intl APIs expect.
 * Used by formatCurrency / formatDate / formatNumber helpers so dashboard
 * pages don't hardcode "nl-NL" and silently show Dutch formats to English
 * users (or vice versa).
 */
const LOCALE_MAP: Record<Locale, string> = {
  nl: "nl-NL",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
}

export function bcp47(locale: string): string {
  return LOCALE_MAP[locale as Locale] ?? "en-GB"
}

export function formatCurrency(amount: number, locale: string, currency = "EUR"): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(
  date: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(bcp47(locale), options).format(d)
}

export function formatTime(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(bcp47(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(bcp47(locale)).format(value)
}
