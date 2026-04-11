import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe/config"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

    // Use admin client to read stripe_account_id — migration 018 revokes
    // this column from authenticated role. Authorization already verified
    // via getUser() above, so admin read is scoped to the session user.
    const admin = createAdminClient()
    const { data: profile } = await admin
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
    logger.error("Error getting balance", error)
    return NextResponse.json(
      { error: "Failed to get balance" },
      { status: 500 }
    )
  }
}
