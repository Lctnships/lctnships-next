import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PayoutsClient } from "./payouts-client"

export const metadata = {
  title: "Uitbetalingsinstellingen",
}

// Mock payout history
const mockPayoutHistory = [
  {
    id: "pay-1",
    date: "Oct 24, 2023",
    reference: "#PAY-9921-STU",
    amount: 1240.00,
    status: "success" as const,
  },
  {
    id: "pay-2",
    date: "Oct 12, 2023",
    reference: "#PAY-9810-STU",
    amount: 850.00,
    status: "success" as const,
  },
  {
    id: "pay-3",
    date: "Sep 28, 2023",
    reference: "#PAY-9755-STU",
    amount: 2100.00,
    status: "pending" as const,
  },
]

export default async function PayoutsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get user's payout settings
  const { data: profile } = await supabase
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

  const payoutHistory = payouts && payouts.length > 0
    ? payouts.map((p, index) => ({
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
    : mockPayoutHistory

  return (
    <PayoutsClient
      stripeConnected={stripeConnected}
      bankDetails={bankDetails}
      payoutHistory={payoutHistory}
    />
  )
}
