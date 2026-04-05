import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { UserProvider } from "@/components/providers/user-provider"
import { getUser, getProfile } from "@/lib/auth"
import { buildAlternateLanguages, localizedPath } from "@/lib/seo"
import { Toaster } from "@/components/ui/sonner"
import { SetHtmlLang } from "@/components/providers/set-html-lang"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: {
      canonical: localizedPath(locale, "/"),
      languages: buildAlternateLanguages("/"),
    },
    openGraph: { locale },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  setRequestLocale(locale)

  // Fetch everything in parallel. getUser/getProfile are React.cache-wrapped,
  // so downstream pages that call them again reuse the same promise.
  const [messages, user, profile] = await Promise.all([
    getMessages(),
    getUser(),
    getProfile(),
  ])

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SetHtmlLang locale={locale} />
      <UserProvider initialUser={user} initialProfile={profile}>
        {children}
      </UserProvider>
      <Toaster position="bottom-right" />
    </NextIntlClientProvider>
  )
}
