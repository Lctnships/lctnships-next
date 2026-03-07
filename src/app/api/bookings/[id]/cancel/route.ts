import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/config"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/bookings/[id]/cancel - Cancel a booking
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reason } = body

    // Get booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios(title, cancellation_policy)
      `)
      .eq("id", id)
      .or(`renter_id.eq.${user.id},host_id.eq.${user.id}`)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      )
    }

    if (booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed booking" },
        { status: 400 }
      )
    }

    // Calculate refund amount based on cancellation policy
    const startDateTime = new Date(booking.start_datetime)
    const now = new Date()
    const hoursUntilStart = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundAmount = 0
    let refundPercentage = 0

    const studioData = booking.studio as { title?: string; cancellation_policy?: string } | null
    const policy = studioData?.cancellation_policy || "flexible"

    if (policy === "flexible") {
      // Full refund up to 24 hours before
      if (hoursUntilStart >= 24) {
        refundPercentage = 100
      } else {
        refundPercentage = 50
      }
    } else if (policy === "moderate") {
      // Full refund up to 5 days before
      if (hoursUntilStart >= 120) {
        refundPercentage = 100
      } else if (hoursUntilStart >= 24) {
        refundPercentage = 50
      } else {
        refundPercentage = 0
      }
    } else if (policy === "strict") {
      // Full refund up to 7 days before, 50% up to 48 hours
      if (hoursUntilStart >= 168) {
        refundPercentage = 100
      } else if (hoursUntilStart >= 48) {
        refundPercentage = 50
      } else {
        refundPercentage = 0
      }
    }

    refundAmount = Math.round((booking.total_amount * refundPercentage) / 100)

    // Process refund if payment was made
    if (booking.payment_status === "paid" && booking.stripe_payment_id && refundAmount > 0 && stripe) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_id,
          amount: Math.round(refundAmount * 100), // Convert to cents
        })
      } catch (stripeError: unknown) {
        console.error("Stripe refund error:", stripeError)
        // Continue with cancellation even if refund fails
      }
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: refundAmount > 0 ? "refunded" : booking.payment_status,
        cancellation_reason: reason,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Notify the other party
    const notifyUserId = user.id === booking.renter_id ? booking.host_id : booking.renter_id
    const cancelledBy = user.id === booking.renter_id ? "renter" : "host"

    await supabase.rpc("create_notification", {
      p_user_id: notifyUserId,
      p_type: "booking_cancelled",
      p_title: "Booking Cancelled",
      p_message: `A booking at ${studioData?.title} has been cancelled by the ${cancelledBy}`,
      p_link: `/bookings/${id}`,
    })

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
      refund: {
        percentage: refundPercentage,
        amount: refundAmount,
      },
    })
  } catch (error: unknown) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel booking" },
      { status: 500 }
    )
  }
}
