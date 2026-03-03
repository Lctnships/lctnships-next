import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Link } from "@/i18n/routing"
import { SignOutButton } from "@/app/[locale]/(dashboard)/settings/sign-out-button"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Settings")
  return { title: t("metaTitle") }
}

export default async function HostSettingsPage() {
  const supabase = await createClient()
  const t = await getTranslations("Settings")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const settingsCards = [
    {
      href: "/profile/edit",
      icon: "badge",
      title: t("cardPersonalTitle"),
      description: t("cardPersonalDesc"),
    },
    {
      href: "/host/settings/privacy",
      icon: "shield_lock",
      title: t("cardPrivacyTitle"),
      description: t("cardPrivacyDesc"),
    },
    {
      href: "/host/settings/security",
      icon: "verified_user",
      title: t("cardSecurityTitle"),
      description: t("cardSecurityDesc"),
    },
  ]

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t("heading")}</h2>
        <p className="text-gray-500 text-sm md:text-lg">
          {t("headingDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {settingsCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex items-center gap-4 md:block"
          >
            <div className="size-10 md:size-12 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center md:mb-4 group-hover:bg-gray-200 transition-colors flex-shrink-0">
              <span className="material-symbols-outlined text-black text-xl md:text-2xl">{card.icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-lg font-bold md:mb-2">{card.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">email</span>
          <h3 className="text-sm md:text-lg font-bold">{t("accountEmail")}</h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-600 text-sm md:text-base truncate">{user.email}</p>
          <span className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-bold flex-shrink-0">
            {t("verified")}
          </span>
        </div>
      </div>

      <SignOutButton />

      <div className="border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-6 bg-red-50/50">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <span className="material-symbols-outlined text-red-500 text-xl md:text-2xl">warning</span>
          <h3 className="text-sm md:text-lg font-bold text-red-700">{t("dangerZone")}</h3>
        </div>
        <p className="text-xs md:text-sm text-red-600 mb-3 md:mb-4">
          {t("dangerZoneDesc")}
        </p>
        <button className="px-4 py-2 md:px-6 md:py-2 border-2 border-red-300 text-red-600 rounded-full font-bold text-xs md:text-sm hover:bg-red-100 transition-colors">
          {t("deleteAccount")}
        </button>
      </div>
    </div>
  )
}
