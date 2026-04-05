import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { SITE_URL } from "@/lib/seo"
import { locales, defaultLocale } from "@/i18n/config"

// Static public routes (relative paths, no locale prefix)
const STATIC_PATHS = [
  "/",
  "/studios",
  "/explore",
  "/cities",
  "/studio-types",
  "/inspiration",
  "/become-host",
  "/help",
  "/safety",
  "/blog",
  "/privacy",
  "/terms",
  "/cookies",
  "/cancellation",
] as const

function withLocale(locale: string, path: string): string {
  if (locale === defaultLocale) return `${SITE_URL}${path === "/" ? "" : path}`
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`
}

function buildLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const loc of locales) languages[loc] = withLocale(loc, path)
  languages["x-default"] = withLocale(defaultLocale, path)
  return languages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages — one entry per locale with hreflang alternates
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
    locales.map((loc) => ({
      url: withLocale(loc, path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1.0 : 0.7,
      alternates: { languages: buildLanguages(path) },
    })),
  )

  // Dynamic pages — pull published studios + blog articles at build time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return staticEntries

  const supabase = createClient(url, key)

  const [studios, articles] = await Promise.all([
    supabase
      .from("studios")
      .select("id, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(5000),
    supabase
      .from("blog_articles")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(5000),
  ])

  const studioEntries: MetadataRoute.Sitemap = (studios.data ?? []).flatMap((s) =>
    locales.map((loc) => ({
      url: withLocale(loc, `/studios/${s.id}`),
      lastModified: s.updated_at ? new Date(s.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: buildLanguages(`/studios/${s.id}`) },
    })),
  )

  const blogEntries: MetadataRoute.Sitemap = (articles.data ?? []).flatMap((a) =>
    locales.map((loc) => ({
      url: withLocale(loc, `/blog/${a.slug}`),
      lastModified: a.updated_at ? new Date(a.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: buildLanguages(`/blog/${a.slug}`) },
    })),
  )

  return [...staticEntries, ...studioEntries, ...blogEntries]
}
