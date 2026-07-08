import { createClient, createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { getResend } from "@/lib/resend"
import { SITE_URL } from "@/lib/seo"
import BookingApprovedEmail from "@/emails/booking-approved"

interface RouteParams {
  params: Promise<{ id: string }>
}

// 72 hours — renter must complete payment before this deadline.
const PAYMENT_DEADLINE_MS = 72 * 60 * 60 * 1000

// POST /api/bookings/[id]/approve
// Host accepts a pending_approval booking. Sets status='approved' and
// payment_status='awaiting_payment' with a 72h payment_deadline.
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify the caller is the host of this booking AND it's currently pending_approval.
    const { data: ownershipRow, error: ownershipErr } = await supabase
      .from("bookings")
      .select("id, host_id, status")
      .eq("id", id)
      .eq("host_id", user.id)
      .single()
    if (ownershipErr || !ownershipRow) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    if (ownershipRow.status !== "pending_approval") {
      return NextResponse.json(
        { error: `Cannot approve booking with status '${ownershipRow.status}'` },
        { status: 400 }
      )
    }

    const admin = await createServiceClient()

    // Guard: another booking may have taken this slot while the request sat
    // pending (competing requests are allowed; only one can be approved).
    const { data: slotRow } = await admin
      .from("bookings")
      .select("studio_id, start_datetime, end_datetime")
      .eq("id", id)
      .single()
    if (slotRow) {
      const { data: taken } = await admin.rpc("booking_slot_taken", {
        p_studio_id: slotRow.studio_id,
        p_start: slotRow.start_datetime,
        p_end: slotRow.end_datetime,
        p_exclude_booking: id,
      })
      if (taken) {
        return NextResponse.json(
          { error: "Een andere boeking bezet dit tijdslot al" },
          { status: 409 }
        )
      }
    }
    const paymentDeadline = new Date(Date.now() + PAYMENT_DEADLINE_MS).toISOString()

    const { data: updated, error: updateErr } = await admin
      .from("bookings")
      .update({
        status: "approved",
        payment_status: "awaiting_payment",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        payment_deadline: paymentDeadline,
        request_expires_at: null,
      })
      .eq("id", id)
      .eq("status", "pending_approval") // defensive — don't overwrite if raced
      .select("id, renter_id, booking_number")
      .single()

    if (updateErr || !updated) {
      logger.error("Booking approval update failed", updateErr, { bookingId: id })
      return NextResponse.json({ error: "Approval failed" }, { status: 500 })
    }

    // Notify renter — payment link lives at /bookings/[id]/pay
    await admin.rpc("create_notification", {
      p_user_id: updated.renter_id,
      p_type: "booking_approved",
      p_title: "Booking request approved",
      p_message: "The host accepted your request. Please complete payment within 72 hours.",
      p_link: `/bookings/${id}/pay`,
    })

    // Email renter with payment link. Fetch renter email + studio title via admin
    // (column grants block joined user.email for authenticated role).
    try {
      const { data: ctx } = await admin
        .from("bookings")
        .select(`
          total_amount, start_datetime, end_datetime,
          renter:users!bookings_renter_id_fkey (email, full_name),
          studio:studios (title, location)
        `)
        .eq("id", id)
        .single()
      const renter = ctx?.renter as { email?: string; full_name?: string } | undefined
      const studio = ctx?.studio as { title?: string; location?: string } | undefined
      const resend = (() => { try { return getResend() } catch { return null } })()
      if (resend && renter?.email) {
        const dt = new Date(ctx!.start_datetime)
        const end = new Date(ctx!.end_datetime)
        await resend.emails.send({
          from: "lctnships <noreply@lctnships.com>",
          to: renter.email,
          subject: `Booking request approved — pay to confirm ${studio?.title ?? ""}`.trim(),
          react: BookingApprovedEmail({
            studioName: studio?.title,
            location: studio?.location,
            dateTime: `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()} – ${end.toLocaleTimeString()}`,
            totalCost: `€${ctx!.total_amount}`,
            baseUrl: `${SITE_URL}/bookings/${id}/pay`,
          }),
        })
      }
    } catch (emailErr) {
      logger.error("Approve email failed (non-fatal)", emailErr, { bookingId: id })
    }

    return NextResponse.json({ booking: updated })
  } catch (error) {
    logger.error("Error approving booking", error)
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 })
  }
}
