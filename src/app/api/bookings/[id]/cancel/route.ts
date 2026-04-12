import { createClient, createServiceClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/config"
import { getResend } from "@/lib/resend"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import BookingCancelledEmail from "@/emails/booking-cancelled"
import HostCancellationEmail from "@/emails/host-cancellation"
import { SITE_URL } from "@/lib/seo"
import { bcp47 } from "@/lib/format-locale"

const SUPPORTED_LOCALES = ["nl", "en", "es", "fr", "de"] as const

function localeFromAcceptLanguage(header: string | null): string {
  if (!header) return "en"
  const first = header.split(",")[0]?.split(";")[0]?.trim().toLowerCase() ?? "en"
  const base = first.split("-")[0]
  return (SUPPORTED_LOCALES as readonly string[]).includes(base) ? base : "en"
}

interface RouteParams {
  params: Promise<{ id: string }>
}

type CancellationPolicy = "flexible" | "moderate" | "strict"

function calculateRefund(
  policy: CancellationPolicy,
  hoursUntilStart: number,
  totalAmount: number,
) {
  let refundPercentage = 0
  if (policy === "flexible") {
    refundPercentage = hoursUntilStart >= 24 ? 100 : 50
  } else if (policy === "moderate") {
    if (hoursUntilStart >= 120) refundPercentage = 100
    else if (hoursUntilStart >= 24) refundPercentage = 50
  } else if (policy === "strict") {
    if (hoursUntilStart >= 168) refundPercentage = 100
    else if (hoursUntilStart >= 48) refundPercentage = 50
  }
  const refundAmount = Math.round((totalAmount * refundPercentage) / 100)
  return { refundPercentage, refundAmount }
}

// POST /api/bookings/[id]/cancel
// Body: { reason?: string, confirmed?: boolean }
// Host-initiated cancels require `confirmed: true` — without it, returns a preview.
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { reason, confirmed } = body as { reason?: string; confirmed?: boolean }

    // Ownership check via user client (RLS-guarded).
    const { data: ownershipRow, error: ownershipErr } = await supabase
      .from("bookings")
      .select("id, renter_id, host_id, status")
      .eq("id", id)
      .or(`renter_id.eq.${user.id},host_id.eq.${user.id}`)
      .single()

    if (ownershipErr || !ownershipRow) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Full row (including sensitive columns like stripe_payment_id, payment_status,
    // and joined user emails) via service client — column grants on bookings/users
    // block these for the authenticated role.
    const serviceClient = await createServiceClient()
    const { data: booking, error: fetchError } = await serviceClient
      .from("bookings")
      .select(`
        id, renter_id, host_id, status, payment_status,
        total_amount, stripe_payment_id,
        start_datetime, end_datetime,
        studio:studios(title, address, cancellation_policy, images),
        renter:users!bookings_renter_id_fkey(id, email, full_name),
        host:users!bookings_host_id_fkey(id, email, full_name)
      `)
      .eq("id", id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
    }
    if (booking.status === "completed") {
      return NextResponse.json({ error: "Cannot cancel a completed booking" }, { status: 400 })
    }

    const isHost = user.id === booking.host_id
    const isRenter = user.id === booking.renter_id

    // Compute refund preview
    const startDateTime = new Date(booking.start_datetime)
    const hoursUntilStart = (startDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
    const studioData = booking.studio as { title?: string; address?: string; cancellation_policy?: string; images?: string[] } | null
    const policy = (studioData?.cancellation_policy as CancellationPolicy) || "flexible"
    const { refundPercentage, refundAmount } = calculateRefund(policy, hoursUntilStart, booking.total_amount)

    // Issue #4 — host-initiated cancels require explicit confirmation.
    // First call returns a preview; UI must show it to host then re-call with confirmed: true.
    if (isHost && confirmed !== true) {
      return NextResponse.json({
        preview: true,
        policy,
        refund: { percentage: refundPercentage, amount: refundAmount },
        message: "Confirm host cancellation by re-calling with { confirmed: true }.",
      })
    }

    // Issue #5 — detect prior payout. Uses service client because:
    //  1. The payouts SELECT policy only allows host_id = auth.uid(), but the
    //     caller may be the renter (who doesn't match). Without service client,
    //     the query returns [] and requiresManualPayoutReversal is never set.
    //  2. The subsequent bookings UPDATE writes payment_status and
    //     requires_manual_payout_reversal — both excluded from the
    //     authenticated column grant (migration 011). Service client bypasses.
    let requiresManualPayoutReversal = false
    if (refundAmount > 0) {
      const { data: existingPayouts } = await serviceClient
        .from("payouts")
        .select("id, amount, status")
        .eq("booking_id", id)
        .in("status", ["paid", "completed", "in_transit"])

      if (existingPayouts && existingPayouts.length > 0) {
        requiresManualPayoutReversal = true
        logger.error("MANUAL ACTION REQUIRED: refund issued on booking with completed payout", {
          bookingId: id,
          refundAmount,
          payouts: existingPayouts,
        })
      }
    }

    // Issue #1 + #2 — Stripe refund MUST succeed before we touch the DB.
    // reverse_application_fee: true returns our 15% Connect fee to the renter too.
    //
    // Source-of-truth for the refund ceiling is the PaymentIntent, NOT our
    // booking.total_amount in the DB. The DB value may have been written
    // from a client-side calculation that drifted by a few cents, which
    // would cause Stripe to reject the refund as "amount_too_large". We
    // retrieve the PaymentIntent, compute the refund based on the actual
    // amount_received, and cap at what can still be refunded (accounting
    // for any prior partial refunds).
    let actualRefundAmountCents = Math.round(refundAmount * 100)
    if (booking.payment_status === "paid" && booking.stripe_payment_id && refundAmount > 0) {
      if (!stripe) {
        logger.error("Stripe not configured, cannot process refund", { bookingId: id })
        return NextResponse.json({ error: "Payment system unavailable" }, { status: 503 })
      }
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripe_payment_id,
          { expand: ["latest_charge"] },
        )
        const amountReceived = paymentIntent.amount_received || 0
        const latestCharge = paymentIntent.latest_charge
        const alreadyRefunded =
          latestCharge && typeof latestCharge === "object" && "amount_refunded" in latestCharge
            ? (latestCharge.amount_refunded as number) || 0
            : 0
        const refundableCents = amountReceived - alreadyRefunded

        // Recompute the refund from the Stripe charge so policy math applies
        // to what the renter actually paid, not what we said they paid.
        const policyPctRefundCents = Math.round((amountReceived * refundPercentage) / 100)
        actualRefundAmountCents = Math.min(policyPctRefundCents, refundableCents)

        if (actualRefundAmountCents <= 0) {
          logger.warn("Cancel flow computed non-positive refund after Stripe reconciliation", {
            bookingId: id,
            policyPctRefundCents,
            refundableCents,
            amountReceived,
          })
        } else {
          await stripe.refunds.create({
            payment_intent: booking.stripe_payment_id,
            amount: actualRefundAmountCents,
            refund_application_fee: true,
            metadata: {
              booking_id: id,
              cancelled_by: isHost ? "host" : "renter",
              cancelled_by_user_id: user.id,
            },
          })
        }
      } catch (stripeError: unknown) {
        logger.error("Stripe refund failed — booking NOT cancelled", {
          bookingId: id,
          paymentIntent: booking.stripe_payment_id,
          refundAmount,
          error: stripeError,
        })
        return NextResponse.json(
          { error: "Refund failed. Booking not cancelled — please try again or contact support." },
          { status: 502 },
        )
      }
    }

    // Refund succeeded (or was not needed) — now update DB via service client.
    // payment_status and requires_manual_payout_reversal are excluded from the
    // authenticated column grant (migration 011), so we need elevated access.
    const { data: updatedBooking, error: updateError } = await serviceClient
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: refundAmount > 0 ? "refunded" : booking.payment_status,
        cancellation_reason: reason ?? null,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        requires_manual_payout_reversal: requiresManualPayoutReversal,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      logger.error("DB update failed AFTER successful Stripe refund — inconsistent state", {
        bookingId: id,
        error: updateError,
      })
      return NextResponse.json(
        { error: "Refund processed but booking update failed. Contact support." },
        { status: 500 },
      )
    }

    // In-app notification to the counterparty
    const renterData = booking.renter as { id?: string; email?: string; full_name?: string } | null
    const hostData = booking.host as { id?: string; email?: string; full_name?: string } | null
    const notifyUserId = isRenter ? booking.host_id : booking.renter_id
    const cancelledBy = isRenter ? "renter" : "host"
    await supabase.rpc("create_notification", {
      p_user_id: notifyUserId,
      p_type: "booking_cancelled",
      p_title: "Booking Cancelled",
      p_message: `A booking at ${studioData?.title ?? "a studio"} has been cancelled by the ${cancelledBy}`,
      p_link: `/bookings/${id}`,
    })

    // Issue #3 — send emails to both parties (localized via Accept-Language)
    const locale = localeFromAcceptLanguage(request.headers.get("accept-language"))
    const bcp = bcp47(locale)
    const startDate = new Date(booking.start_datetime)
    const endDate = new Date(booking.end_datetime)
    const dateTimeStr = `${startDate.toLocaleDateString(bcp, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })} · ${startDate.toLocaleTimeString(bcp, { hour: "2-digit", minute: "2-digit" })} – ${endDate.toLocaleTimeString(bcp, { hour: "2-digit", minute: "2-digit" })}`
    const studioImage = Array.isArray(studioData?.images) && studioData.images.length > 0
      ? studioData.images[0]
      : undefined
    const refundAmountStr = `€${refundAmount.toFixed(2)}`
    const resend = (() => {
      try { return getResend() } catch { return null }
    })()

    if (resend) {
      const emails: Promise<unknown>[] = []
      if (renterData?.email) {
        emails.push(
          resend.emails.send({
            from: "lctnships <noreply@lctnships.com>",
            to: renterData.email,
            subject: `Your booking at ${studioData?.title ?? "the studio"} has been cancelled`,
            react: BookingCancelledEmail({
              studioName: studioData?.title,
              studioImage,
              dateTime: dateTimeStr,
              location: studioData?.address,
              refundAmount: refundAmountStr,
              refundPercentage: `${refundPercentage}%`,
              cancellationPolicy: policy,
              baseUrl: SITE_URL,
            }),
          }),
        )
      }
      if (hostData?.email) {
        emails.push(
          resend.emails.send({
            from: "lctnships <noreply@lctnships.com>",
            to: hostData.email,
            subject: `Booking at ${studioData?.title ?? "your studio"} has been cancelled`,
            react: HostCancellationEmail({
              renterName: renterData?.full_name,
              studioName: studioData?.title,
              dateTime: dateTimeStr,
              refundAmount: refundAmountStr,
              cancellationReason: reason ?? "No reason provided",
              baseUrl: SITE_URL,
            }),
          }),
        )
      }
      const results = await Promise.allSettled(emails)
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          logger.error("Cancellation email failed", { bookingId: id, recipient: i === 0 ? "renter" : "host", error: r.reason })
        }
      })
    } else {
      logger.error("Resend not configured, cancellation emails not sent", { bookingId: id })
    }

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
      refund: { percentage: refundPercentage, amount: refundAmount },
      requiresManualPayoutReversal,
    })
  } catch (error: unknown) {
    logger.error("Error cancelling booking", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
