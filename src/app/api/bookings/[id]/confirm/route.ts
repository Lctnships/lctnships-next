import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getResend } from "@/lib/resend"
import BookingConfirmedEmail from "@/emails/booking-confirmed"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

    // Get booking and verify host. No users join — sensitive columns
    // (email, phone) go via admin client below after authorization passes.
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios(title, address, images)
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
      p_message: `Your booking at ${(booking.studio as { title?: string } | null)?.title} has been confirmed`,
      p_link: `/bookings/${id}`,
    })

    // Send confirmation email to renter. Fetch renter + host contact via
    // admin client — migration 018 blocks these columns from authenticated.
    const admin = createAdminClient()
    const [{ data: renter }, { data: host }] = await Promise.all([
      admin
        .from("users")
        .select("full_name, email")
        .eq("id", booking.renter_id)
        .single(),
      admin
        .from("users")
        .select("full_name, phone")
        .eq("id", booking.host_id)
        .single(),
    ])

    const studio = booking.studio as { title?: string; address?: string; images?: string[] } | null

    const startDate = new Date(booking.start_datetime)
    const endDate = new Date(booking.end_datetime)
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

    if (renter?.email) {
      await getResend().emails.send({
        from: "lctnships <noreply@lctnships.com>",
        to: renter.email,
        subject: `Your session at ${studio?.title} is confirmed!`,
        react: BookingConfirmedEmail({
          studioName: studio?.title,
          studioImage,
          dateTime: dateTimeStr,
          location: studio?.address,
          hostName: host?.full_name ?? undefined,
          hostPhone: host?.phone ?? undefined,
        }),
      })
    }

    return NextResponse.json({
      message: "Booking confirmed successfully",
      booking: updatedBooking,
    })
  } catch (error: unknown) {
    logger.error("Error confirming booking", error)
    return NextResponse.json(
      { error: "Failed to confirm booking" },
      { status: 500 }
    )
  }
}
