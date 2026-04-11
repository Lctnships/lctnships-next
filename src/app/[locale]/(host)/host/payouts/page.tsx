import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { PayoutsClient } from "./payouts-client"

export const metadata = {
  title: "Uitbetalingsinstellingen",
}


export default async function PayoutsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Admin client for sensitive bank / stripe fields — migration 018 blocks
  // authenticated from reading these. Authorization already verified above.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("stripe_account_id, bank_account_name, bank_iban, bank_bic")
    .eq("id", user.id)
    .single()

  // Get payout history
  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, amount, status, created_at")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const stripeConnected = !!profile?.stripe_account_id
  const bankDetails = {
    accountHolderName: profile?.bank_account_name || "",
    iban: profile?.bank_iban || "",
    bic: profile?.bank_bic || "",
  }

  const payoutHistory = (payouts || []).map((p, index) => ({
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    reference: `#PAY-${(9999 - index).toString()}-STU`,
    amount: p.amount,
    status: p.status as "success" | "pending",
  }))

  return (
    <PayoutsClient
      stripeConnected={stripeConnected}
      bankDetails={bankDetails}
      payoutHistory={payoutHistory}
    />
  )
}
