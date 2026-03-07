import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
    console.error("Error fetching payouts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch payouts" },
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

    // Check if user has bank details
    const { data: userDetails } = await supabase
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

    // Mark payouts as processing
    const payoutIds = pendingPayouts.map(p => p.id)
    const totalAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0)

    const { error: updateError } = await supabase
      .from("payouts")
      .update({ status: "processing" })
      .in("id", payoutIds)

    if (updateError) throw updateError

    // TODO: Integrate with Stripe Connect for actual payout
    // For now, we just mark them as processing
    // In production, you would:
    // 1. Create a Stripe Transfer to the connected account
    // 2. Or trigger a bank transfer via your payment provider

    return NextResponse.json({
      message: "Payout request submitted",
      payout_count: pendingPayouts.length,
      total_amount: totalAmount,
    })
  } catch (error: unknown) {
    console.error("Error requesting payout:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to request payout" },
      { status: 500 }
    )
  }
}
