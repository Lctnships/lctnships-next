import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe/config"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// POST /api/stripe/create-payout - Request a payout
export async function POST(request: Request) {
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

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // Get user's Stripe account via admin client — migration 018 blocks
    // authenticated from reading stripe_account_id.
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json(
        { error: "Stripe account not connected" },
        { status: 400 }
      )
    }

    // Get available balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: profile.stripe_account_id,
    })

    const availableBalance = balance.available.reduce(
      (sum, b) => sum + (b.currency === "eur" ? b.amount : 0),
      0
    ) / 100 // Convert from cents

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: €${availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create payout with idempotency key to prevent duplicate payouts on retry.
    // The key MUST be deterministic for the same logical request — Date.now()
    // was previously included here, which defeated idempotency because a retry
    // would compute a fresh timestamp and Stripe would treat it as a new payout.
    const amountInCents = Math.round(amount * 100)
    const payout = await stripe.payouts.create(
      {
        amount: amountInCents,
        currency: "eur",
      },
      {
        stripeAccount: profile.stripe_account_id,
        idempotencyKey: `payout-${user.id}-${amountInCents}`,
      }
    )

    // Record payout in database
    const { data: payoutRecord, error: dbError } = await supabase
      .from("payouts")
      .insert({
        host_id: user.id,
        amount,
        currency: "EUR",
        status: payout.status,
        stripe_payout_id: payout.id,
        paid_at: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : null,
      })
      .select()
      .single()

    if (dbError) {
      logger.error("Error recording payout", dbError)
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        status: payout.status,
        arrivalDate: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : null,
      },
      record: payoutRecord,
    })
  } catch (error: unknown) {
    logger.error("Error creating payout", error)
    return NextResponse.json(
      { error: "Failed to create payout" },
      { status: 500 }
    )
  }
}
