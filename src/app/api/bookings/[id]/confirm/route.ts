import { createClient } from "@/lib/supabase/server"
import { getResend } from "@/lib/resend"
import BookingConfirmedEmail from "@/emails/booking-confirmed"
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
        studio:studios(title, address, images),
        renter:users!bookings_renter_id_fkey(full_name, email),
        host:users!bookings_host_id_fkey(full_name, phone)
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

    // Verify payment has been made before allowing confirmation
    // Only allow confirmation if payment is completed or if it's an instant book (pre-authorized)
    if (booking.payment_status !== "paid" && booking.payment_status !== "authorized") {
      return NextResponse.json(
        { error: "Cannot confirm booking: payment not completed" },
        { status: 400 }
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

    // Notify renter
    await supabase.rpc("create_notification", {
      p_user_id: booking.renter_id,
      p_type: "booking_confirmed",
      p_title: "Booking Confirmed!",
      p_message: `Your booking at ${(booking.studio as any)?.title} has been confirmed`,
      p_link: `/bookings/${id}`,
    })

    // Send confirmation email to renter
    const studio = booking.studio as any
    const renter = booking.renter as any
    const host = booking.host as any

    const startDate = new Date(booking.start_time)
    const endDate = new Date(booking.end_time)
    const dateTimeStr = `${startDate.toLocaleDateString("nl-NL", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })} • ${startDate.toLocaleTimeString("nl-NL", {
      hour: "numeric",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString("nl-NL", {
      hour: "numeric",
      minute: "2-digit",
    })}`

    const studioImage = Array.isArray(studio?.images) && studio.images.length > 0
      ? studio.images[0]
      : undefined

    await getResend().emails.send({
      from: "lcntships <noreply@lcntships.com>",
      to: renter?.email,
      subject: `Your session at ${studio?.title} is confirmed!`,
      react: BookingConfirmedEmail({
        studioName: studio?.title,
        studioImage,
        dateTime: dateTimeStr,
        location: studio?.address,
        hostName: host?.full_name,
        hostPhone: host?.phone,
      }),
    })

    return NextResponse.json({
      message: "Booking confirmed successfully",
      booking: updatedBooking,
    })
  } catch (error: unknown) {
    console.error("Error confirming booking:", error)
    return NextResponse.json(
      { error: "Failed to confirm booking" },
      { status: 500 }
    )
  }
}
