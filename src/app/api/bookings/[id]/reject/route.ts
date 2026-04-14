import { createClient, createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { getResend } from "@/lib/resend"
import { SITE_URL } from "@/lib/seo"
import BookingDeclinedEmail from "@/emails/booking-declined"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : null

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
        { error: `Cannot reject booking with status '${ownershipRow.status}'` },
        { status: 400 }
      )
    }

    const admin = await createServiceClient()
    const { data: updated, error: updateErr } = await admin
      .from("bookings")
      .update({
        status: "rejected",
        payment_status: "none",
        rejected_at: new Date().toISOString(),
        rejected_reason: reason,
        request_expires_at: null,
      })
      .eq("id", id)
      .eq("status", "pending_approval")
      .select("id, renter_id, booking_number")
      .single()

    if (updateErr || !updated) {
      logger.error("Booking rejection update failed", updateErr, { bookingId: id })
      return NextResponse.json({ error: "Rejection failed" }, { status: 500 })
    }

    await admin.rpc("create_notification", {
      p_user_id: updated.renter_id,
      p_type: "booking_rejected",
      p_title: "Booking request declined",
      p_message: reason
        ? `Host declined your request: ${reason}`
        : "The host declined your booking request.",
      p_link: `/bookings/${id}`,
    })

    try {
      const { data: ctx } = await admin
        .from("bookings")
        .select(`
          renter:users!bookings_renter_id_fkey (email, full_name),
          host:users!bookings_host_id_fkey (full_name)
        `)
        .eq("id", id)
        .single()
      const renter = ctx?.renter as { email?: string; full_name?: string } | undefined
      const host = ctx?.host as { full_name?: string } | undefined
      const resend = (() => { try { return getResend() } catch { return null } })()
      if (resend && renter?.email) {
        await resend.emails.send({
          from: "lctnships <noreply@lctnships.com>",
          to: renter.email,
          subject: "Your booking request was declined",
          react: BookingDeclinedEmail({
            userName: renter.full_name,
            hostName: host?.full_name,
            hostMessage: reason ?? undefined,
            baseUrl: SITE_URL,
          }),
        })
      }
    } catch (emailErr) {
      logger.error("Reject email failed (non-fatal)", emailErr, { bookingId: id })
    }

    return NextResponse.json({ booking: updated })
  } catch (error) {
    logger.error("Error rejecting booking", error)
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 })
  }
}
