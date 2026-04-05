import { locales, defaultLocale } from "@/i18n/config"

/**
 * Canonical site URL used for metadataBase, sitemap, robots, and OG tags.
 * Configure via NEXT_PUBLIC_SITE_URL (e.g. https://lctnships.com) in Vercel.
 * Falls back to the Vercel preview URL, then localhost for dev.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export const SITE_NAME = "lctnships"

/**
 * Build the localized URL path for a given locale + pathname.
 * Uses next-intl's `as-needed` prefixing: the default locale gets no prefix.
 */
export function localizedPath(locale: string, pathname: string = "/"): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (locale === defaultLocale) return clean === "/" ? "/" : clean
  return `/${locale}${clean === "/" ? "" : clean}`
}

/**
 * Return a language → URL mapping for hreflang alternates.
 * Pass the pathname *without* locale prefix (e.g. "/studios").
 */
export function buildAlternateLanguages(pathname: string = "/") {
  const languages: Record<string, string> = {}
  for (const loc of locales) {
    languages[loc] = localizedPath(loc, pathname)
  }
  // x-default points to the default locale
  languages["x-default"] = localizedPath(defaultLocale, pathname)
  return languages
}
