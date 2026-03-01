import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPackages, getUserCreditsRecord, getCreditTransactions } from "@/lib/credits"
import { CreditPackages } from "@/components/credits/CreditPackages"
import { UserCredits } from "@/components/credits/UserCredits"
import { CreditTransactions } from "@/components/credits/CreditTransactions"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Credits")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function CreditsPage() {
  const t = await getTranslations("Credits")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/credits")
  }

  // Fetch data in parallel
  const [packages, userCredits, transactions] = await Promise.all([
    getPackages(),
    getUserCreditsRecord(user.id),
    getCreditTransactions(user.id, 20),
  ])

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* User's current credits */}
      <div className="mb-10">
        <UserCredits
          credits={userCredits?.credits_remaining || 0}
          totalPurchased={userCredits?.credits_total || 0}
        />
      </div>

      {/* Available packages */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">{t("choosePackage")}</h2>
        <CreditPackages packages={packages} />
      </div>

      {/* How it works */}
      <div className="bg-muted/50 rounded-2xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6">{t("howItWorksTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold">{t("step1Title")}</h3>
            <p className="text-muted-foreground text-sm">
              {t("step1Desc")}
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold">{t("step2Title")}</h3>
            <p className="text-muted-foreground text-sm">
              {t("step2Desc")}
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold">{t("step3Title")}</h3>
            <p className="text-muted-foreground text-sm">
              {t("step3Desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="mb-10">
          <CreditTransactions transactions={transactions} />
        </div>
      )}

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t("faqTitle")}</h2>
        <div className="grid gap-4">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">{t("faqQ1")}</h3>
            <p className="text-muted-foreground">
              {t("faqA1")}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">
              {t("faqQ2")}
            </h3>
            <p className="text-muted-foreground">
              {t("faqA2")}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">
              {t("faqQ3")}
            </h3>
            <p className="text-muted-foreground">
              {t("faqA3")}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">
              {t("faqQ4")}
            </h3>
            <p className="text-muted-foreground">
              {t("faqA4")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
