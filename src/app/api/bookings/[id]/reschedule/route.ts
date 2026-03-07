import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/bookings/[id]/reschedule - Reschedule a booking
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { new_start_datetime, new_end_datetime } = body

    if (!new_start_datetime || !new_end_datetime) {
      return NextResponse.json(
        { error: "New start and end datetime are required" },
        { status: 400 }
      )
    }

    // Get original booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios(title)
      `)
      .eq("id", id)
      .eq("renter_id", user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if booking can be rescheduled
    if (booking.status === "cancelled" || booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot reschedule a cancelled or completed booking" },
        { status: 400 }
      )
    }

    // Check if rescheduling is allowed (at least 24 hours before)
    const originalStart = new Date(booking.start_datetime)
    const now = new Date()
    const hoursUntilStart = (originalStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilStart < 24) {
      return NextResponse.json(
        { error: "Rescheduling must be done at least 24 hours before the session" },
        { status: 400 }
      )
    }

    // Check for conflicts with new time
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("studio_id", booking.studio_id)
      .neq("id", id)
      .neq("status", "cancelled")
      .or(`and(start_datetime.lt.${new_end_datetime},end_datetime.gt.${new_start_datetime})`)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: "The new time slot conflicts with an existing booking" },
        { status: 400 }
      )
    }

    // Calculate new duration
    const newStart = new Date(new_start_datetime)
    const newEnd = new Date(new_end_datetime)
    const totalHours = (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60)

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        start_datetime: new_start_datetime,
        end_datetime: new_end_datetime,
        total_hours: totalHours,
        original_start_datetime: booking.original_start_datetime || booking.start_datetime,
        original_end_datetime: booking.original_end_datetime || booking.end_datetime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Notify host
    await supabase.rpc("create_notification", {
      p_user_id: booking.host_id,
      p_type: "booking_rescheduled",
      p_title: "Booking Rescheduled",
      p_message: `A booking at ${(booking.studio as { title?: string } | null)?.title} has been rescheduled`,
      p_link: `/host/bookings/${id}`,
    })

    return NextResponse.json({
      message: "Booking rescheduled successfully",
      booking: updatedBooking,
    })
  } catch (error: unknown) {
    console.error("Error rescheduling booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reschedule booking" },
      { status: 500 }
    )
  }
}
