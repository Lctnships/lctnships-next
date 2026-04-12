import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("HostSettings")
  return { title: t("metaTitle") }
}

export default async function HostSettingsPage() {
  const supabase = await createClient()
  const t = await getTranslations("HostSettings")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("email, stripe_account_id")
    .eq("id", user.id)
    .single()

  const stripeConnected = !!profile?.stripe_account_id

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t("heading")}</h2>
        <p className="text-gray-500 text-sm md:text-lg">{t("headingDescription")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <Link
          href="/host/settings/privacy"
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex items-center gap-4 md:block"
        >
          <div className="size-10 md:size-12 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center md:mb-4 group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-black text-xl md:text-2xl">visibility</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-lg font-bold md:mb-2">{t("cardNotificationsTitle")}</h3>
            <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{t("cardNotificationsDesc")}</p>
          </div>
        </Link>

        <Link
          href="/host/settings/security"
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex items-center gap-4 md:block"
        >
          <div className="size-10 md:size-12 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center md:mb-4 group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-black text-xl md:text-2xl">shield_lock</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-lg font-bold md:mb-2">{t("cardSecurityTitle")}</h3>
            <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{t("cardSecurityDesc")}</p>
          </div>
        </Link>

        <Link
          href="/host/settings/payouts"
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex items-center gap-4 md:block"
        >
          <div className="size-10 md:size-12 rounded-lg md:rounded-xl bg-gray-100 flex items-center justify-center md:mb-4 group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-black text-xl md:text-2xl">account_balance</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-lg font-bold md:mb-2">{t("cardPayoutsTitle")}</h3>
            <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{t("cardPayoutsDesc")}</p>
            {stripeConnected && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Stripe Connected
              </span>
            )}
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">email</span>
          <h3 className="text-sm md:text-lg font-bold">{t("accountEmail")}</h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-600 text-sm md:text-base truncate">{profile?.email || user.email}</p>
          <span className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-bold flex-shrink-0">
            {t("verified")}
          </span>
        </div>
      </div>
    </div>
  )
}
