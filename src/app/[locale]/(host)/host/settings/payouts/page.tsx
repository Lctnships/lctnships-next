import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("HostSettings")
  return { title: t("cardPayoutsTitle") }
}

export default async function HostPayoutsSettingsPage() {
  const supabase = await createClient()
  const t = await getTranslations("HostSettings")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("stripe_account_id, bank_account_name, bank_iban")
    .eq("id", user.id)
    .single()

  const stripeConnected = !!profile?.stripe_account_id
  const hasBankAccount = !!profile?.bank_account_name && !!profile?.bank_iban

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div>
        <h2 className="text-2xl font-bold">{t("payoutsHeading")}</h2>
        <p className="text-gray-500 text-sm mt-1">{t("payoutsDesc")}</p>
      </div>

      <div className="space-y-4">
        {/* Stripe Connect */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600">account_balance</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Stripe Connect</h3>
                <p className="text-xs text-gray-500">
                  {stripeConnected ? t("stripeConnectedDesc") || "Account gekoppeld" : t("stripeNotConnectedDesc") || "Koppel je account"}
                </p>
              </div>
            </div>
            {stripeConnected ? (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">{t("stripeActive") || "Actief"}</span>
            ) : (
              <Link href="/host/payouts" className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-black/90 transition-colors">
                {t("stripeConnect") || "Koppelen"}
              </Link>
            )}
          </div>
        </div>

        {/* Bank Account */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">credit_card</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">{t("manageBankAccount")}</h3>
                <p className="text-xs text-gray-500">
                  {hasBankAccount ? `${profile.bank_account_name}` : t("noBankAccount") || "Nog geen bankrekening"}
                </p>
              </div>
            </div>
            <Link href="/host/payouts" className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">
              {hasBankAccount ? t("changeBankAccount") || "Wijzigen" : t("addBankAccount") || "Toevoegen"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
