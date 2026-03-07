import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/config"
import { NextResponse } from "next/server"

// GET /api/stripe/balance - Get available balance for payout
export async function GET(_request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        available: 0,
        pending: 0,
        currency: "EUR",
      })
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: profile.stripe_account_id,
    })

    // Calculate EUR amounts
    const available = balance.available.reduce(
      (sum, b) => sum + (b.currency === "eur" ? b.amount : 0),
      0
    ) / 100

    const pending = balance.pending.reduce(
      (sum, b) => sum + (b.currency === "eur" ? b.amount : 0),
      0
    ) / 100

    return NextResponse.json({
      available,
      pending,
      currency: "EUR",
    })
  } catch (error: unknown) {
    console.error("Error getting balance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get balance" },
      { status: 500 }
    )
  }
}
