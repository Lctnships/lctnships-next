import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET /api/payouts - Get host's payouts
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("payouts")
      .select(`
        *,
        booking:bookings (
          id,
          booking_number,
          start_datetime,
          end_datetime,
          total_hours,
          studio:studios (
            title
          ),
          renter:users!bookings_renter_id_fkey (
            full_name
          )
        )
      `)
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: payouts, error } = await query

    if (error) throw error

    // Calculate summary
    const { data: summary } = await supabase
      .from("payouts")
      .select("amount, status")
      .eq("host_id", user.id)

    const totals = {
      total_earned: 0,
      pending: 0,
      processing: 0,
      completed: 0,
    }

    summary?.forEach((payout: { amount: number; status: string }) => {
      totals.total_earned += payout.amount
      if (payout.status === "pending") totals.pending += payout.amount
      if (payout.status === "processing") totals.processing += payout.amount
      if (payout.status === "completed") totals.completed += payout.amount
    })

    return NextResponse.json({
      payouts,
      summary: totals,
    })
  } catch (error: unknown) {
    logger.error("Error fetching payouts", error)
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    )
  }
}

// POST /api/payouts - Request payout (manual trigger)
export async function POST(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has bank details via admin client — migration 018 blocks
    // authenticated from reading bank_iban / stripe_account_id.
    const admin = createAdminClient()
    const { data: userDetails } = await admin
      .from("users")
      .select("bank_iban, stripe_account_id")
      .eq("id", user.id)
      .single()

    if (!userDetails?.bank_iban && !userDetails?.stripe_account_id) {
      return NextResponse.json(
        { error: "Please add bank account or Stripe Connect details first" },
        { status: 400 }
      )
    }

    // Get pending payouts
    const { data: pendingPayouts, error: fetchError } = await supabase
      .from("payouts")
      .select("id, amount")
      .eq("host_id", user.id)
      .eq("status", "pending")

    if (fetchError) throw fetchError

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return NextResponse.json(
        { error: "No pending payouts to process" },
        { status: 400 }
      )
    }

    const payoutIds = pendingPayouts.map(p => p.id)
    const totalAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0)

    // Verify Stripe balance before processing
    if (userDetails.stripe_account_id) {
      try {
        const { stripe: stripeLib } = await import("@/lib/stripe/config")
        if (stripeLib) {
          const balance = await stripeLib.balance.retrieve({
            stripeAccount: userDetails.stripe_account_id,
          })
          const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100
          if (available < totalAmount) {
            return NextResponse.json(
              { error: `Insufficient Stripe balance (€${available.toFixed(2)} available, €${totalAmount.toFixed(2)} requested)` },
              { status: 400 }
            )
          }
        }
      } catch (balanceError) {
        logger.error("Failed to verify Stripe balance", balanceError)
        return NextResponse.json(
          { error: "Could not verify Stripe balance. Try again later." },
          { status: 503 }
        )
      }
    }

    // Mark payouts as processing (idempotency: only update pending rows)
    const { error: updateError, count } = await supabase
      .from("payouts")
      .update({ status: "processing" })
      .in("id", payoutIds)
      .eq("status", "pending")

    if (updateError) throw updateError

    // Guard: if no rows were updated, another request already processed them
    if (count === 0) {
      return NextResponse.json(
        { error: "Payouts already being processed" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      message: "Payout request submitted",
      payout_count: pendingPayouts.length,
      total_amount: totalAmount,
    })
  } catch (error: unknown) {
    logger.error("Error requesting payout", error)
    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 }
    )
  }
}
