import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/bookings/[id]/confirm - Host confirms a booking
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get booking and verify host
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios(title),
        renter:users!bookings_renter_id_fkey(full_name, email)
      `)
      .eq("id", id)
      .eq("host_id", user.id)
      .eq("status", "pending")
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or already processed" },
        { status: 404 }
      )
    }

    // Guard: another booking may have been confirmed for this slot meanwhile
    const { data: slotTaken, error: conflictError } = await supabase.rpc(
      "booking_slot_taken",
      {
        p_studio_id: booking.studio_id,
        p_start: booking.start_datetime,
        p_end: booking.end_datetime,
        p_exclude_booking: id,
      }
    )

    if (conflictError) throw conflictError
    if (slotTaken) {
      return NextResponse.json(
        { error: "Another confirmed booking already occupies this time slot" },
        { status: 409 }
      )
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Notify renter: accepted, now pay to finalize
    await supabase.rpc("create_notification", {
      p_user_id: booking.renter_id,
      p_type: "booking_confirmed",
      p_title: "Booking Accepted — complete your payment",
      p_message: `Your booking at ${(booking.studio as any)?.title} has been accepted. Pay now to secure your slot.`,
      p_link: `/bookings`,
    })

    // TODO: Send confirmation email to renter

    return NextResponse.json({
      message: "Booking confirmed successfully",
      booking: updatedBooking,
    })
  } catch (error: any) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to confirm booking" },
      { status: 500 }
    )
  }
}
