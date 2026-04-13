import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { addCredits } from "@/lib/credits"
import { createServiceClient } from "@/lib/supabase/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

// Force Node.js runtime. The Stripe SDK uses Node APIs (crypto for signature
// verification, TLS) that are not available in the Edge runtime. Without this
// pin, a future Vercel config change could silently route the webhook through
// Edge and break signature verification.
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    logger.error("Webhook signature verification failed", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Use service client for webhook operations (elevated permissions)
  const supabase = await createServiceClient()

  // Idempotency guard. Stripe delivers events at-least-once; a transient 500
  // or network drop triggers a retry. Insert first with the event id as PK —
  // if we already processed this event (status = 'done'), the unique
  // constraint fires and we bail out before any side effects run.
  //
  // For retries of failed/stalled events we perform an atomic CAS: a new
  // handler can only claim the row if the prior attempt is 'failed' OR the
  // prior 'processing' row is older than STALE_THRESHOLD. Two concurrent
  // retries can't both pass this guard — exactly one will get a returned row
  // from the UPDATE, the other gets [] and short-circuits.
  const STALE_THRESHOLD_MS = 5 * 60 * 1000
  const staleBefore = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString()

  const { error: idempotencyError } = await supabase
    .from("processed_webhook_events")
    .insert({ stripe_event_id: event.id, event_type: event.type, status: "processing" })

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
      // Atomic claim: UPDATE ... WHERE stripe_event_id=? AND (status='failed'
      // OR (status='processing' AND processed_at < staleBefore)) RETURNING id.
      // Supabase REST expresses the AND clause via nested filters.
      const { data: claimed, error: claimErr } = await supabase
        .from("processed_webhook_events")
        .update({ status: "processing", processed_at: new Date().toISOString() })
        .eq("stripe_event_id", event.id)
        .or(`status.eq.failed,and(status.eq.processing,processed_at.lt.${staleBefore})`)
        .select("stripe_event_id")

      if (claimErr) {
        logger.error("Failed to atomically claim webhook event", claimErr)
        return NextResponse.json({ error: "Failed to claim event" }, { status: 500 })
      }
      if (!claimed || claimed.length === 0) {
        logger.info("Webhook event already done or actively processing, skipping", { eventId: event.id, eventType: event.type })
        return NextResponse.json({ received: true, duplicate: true })
      }
      logger.warn("Webhook event reclaiming after failed/stalled prior attempt", { eventId: event.id })
    } else {
      logger.error("Failed to record webhook event for idempotency", idempotencyError)
      return NextResponse.json({ error: "Failed to record event" }, { status: 500 })
    }
  }

  try {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentType = session.metadata?.type

      logger.info("Checkout completed", {
        sessionId: session.id,
        type: paymentType,
      })

      // Handle credit purchase
      if (paymentType === "credit_purchase") {
        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const credits = parseInt(session.metadata?.credits || "0")

        if (userId && packageId && credits > 0) {
          try {
            // Pass the service client so addCredits runs with elevated perms —
            // migration 011 locked user_credits/credit_transactions to service_role.
            await addCredits(userId, credits, packageId, session.id, supabase)
            logger.info("Added credits for user", { userId, credits })

            // Log to transactions table
            await supabase.from("transactions").insert({
              user_id: userId,
              type: "credit_purchase",
              amount: (session.amount_total || 0) / 100,
              status: "completed",
              stripe_session_id: session.id,
              description: `Credit package: ${credits} credits`,
            })
          } catch (error) {
            logger.error("Failed to add credits", error)
          }
        }
      }
      // Handle booking payment
      else if (paymentType === "booking_payment" || session.metadata?.bookingId || session.metadata?.booking_id) {
        const bookingId = session.metadata?.bookingId ?? session.metadata?.booking_id
        // Compute platform fee server-side from the actual session amount.
        // Previously this read session.metadata.platformFee, which was set to
        // "0" whenever the upstream route forgot to include it, silently
        // corrupting the transactions audit log. Metadata is still used as a
        // preference when present and consistent, but amount_total * 15% is
        // the source of truth.
        const amountTotalCents = session.amount_total || 0
        const computedFeeCents = Math.round(amountTotalCents * 0.15)
        const metaFeeCents = parseInt(session.metadata?.platformFee || "0")
        const platformFee = metaFeeCents > 0 ? metaFeeCents : computedFeeCents

        if (bookingId && bookingId !== "" && !bookingId.startsWith("temp_")) {
          try {
            // Fetch the booking's studio to check is_instant_book. If the host
            // has instant-book disabled, the booking stays "pending" after
            // payment so the host can accept/decline from their dashboard.
            // This was previously hardcoded to "confirmed" for all bookings,
            // which meant request-mode studios had no approval step.
            const { data: bookingForStatus } = await supabase
              .from("bookings")
              .select("studio:studios(is_instant_book)")
              .eq("id", bookingId)
              .single()

            const isInstantBook = (bookingForStatus?.studio as { is_instant_book?: boolean } | null)?.is_instant_book ?? true
            const newStatus = isInstantBook ? "confirmed" : "pending"

            await supabase
              .from("bookings")
              .update({
                status: newStatus,
                payment_status: "paid",
                paid_at: new Date().toISOString(),
                stripe_payment_intent: session.payment_intent as string,
              })
              .eq("id", bookingId)

            // Log transaction
            await supabase.from("transactions").insert({
              booking_id: bookingId,
              type: "booking_payment",
              amount: (session.amount_total || 0) / 100,
              platform_fee: platformFee / 100,
              status: "completed",
              stripe_session_id: session.id,
            })

            // Create notification for host
            const { data: booking } = await supabase
              .from("bookings")
              .select("host_id, studio:studios(title)")
              .eq("id", bookingId)
              .single()

            if (booking?.host_id) {
              const studioTitle = (booking.studio as { title?: string } | null)?.title
              await supabase.from("notifications").insert({
                user_id: booking.host_id,
                type: isInstantBook ? "payment_received" : "booking_request",
                title: isInstantBook ? "Payment received" : "New booking request",
                message: isInstantBook
                  ? `Payment received for ${studioTitle}`
                  : `New booking request for ${studioTitle} — please accept or decline`,
                link: `/host/bookings/${bookingId}`,
              })
            }

            logger.info("Booking payment processed", { bookingId, status: newStatus })
          } catch (error) {
            logger.error("Failed to update booking", error)
          }
        } else {
          logger.info("Payment received without booking", { sessionId: session.id })
        }
      }
      // Handle extension payment
      else if (paymentType === "extension_payment" && session.metadata?.extension_id) {
        const extensionId = session.metadata.extension_id
        const bookingId = session.metadata.booking_id

        try {
          await supabase
            .from("booking_extensions")
            .update({
              payment_status: "paid",
              stripe_payment_id: session.payment_intent as string,
            })
            .eq("id", extensionId)

          const { data: extension } = await supabase
            .from("booking_extensions")
            .select("booking_id, extra_hours, total_extension_price, host_payout, host_id, studio_id")
            .eq("id", extensionId)
            .single()

          if (extension && bookingId) {
            const { data: originalBooking } = await supabase
              .from("bookings")
              .select("end_datetime, original_end_datetime, total_hours")
              .eq("id", extension.booking_id)
              .single()

            const currentEnd = new Date(originalBooking?.end_datetime || new Date())
            const newEnd = new Date(currentEnd.getTime() + extension.extra_hours * 60 * 60 * 1000)

            await supabase
              .from("bookings")
              .update({
                end_datetime: newEnd.toISOString(),
                total_hours: extension.extra_hours + (originalBooking?.total_hours || 0),
              })
              .eq("id", extension.booking_id)

            await supabase.from("transactions").insert({
              booking_id: extension.booking_id,
              type: "extension_payment",
              amount: extension.total_extension_price,
              platform_fee: extension.total_extension_price - extension.host_payout,
              status: "completed",
              stripe_session_id: session.id,
              description: `Session extension: +${extension.extra_hours} hours`,
            })

            const renterId = session.metadata?.user_id
            const { data: renter } = renterId
              ? await supabase.from("users").select("full_name").eq("id", renterId).single()
              : { data: null }

            await supabase.from("notifications").insert({
              user_id: extension.host_id,
              type: "booking_extension",
              title: "Session extended",
              message: `${renter?.full_name || "A renter"} extended the session by ${extension.extra_hours}h`,
              link: `/host/bookings/${extension.booking_id}`,
            })

            logger.info("Extension payment processed", { extensionId, bookingId })
          }
        } catch (error) {
          logger.error("Failed to process extension payment", error)
        }
      }
      break
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      if (bookingId && bookingId !== "" && !bookingId.startsWith("temp_")) {
        await supabase
          .from("bookings")
          .update({ payment_status: "expired" })
          .eq("id", bookingId)
      }

      logger.info("Checkout session expired", { sessionId: session.id })
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      logger.warn("Payment failed", {
        paymentIntentId: paymentIntent.id,
        reason: paymentIntent.last_payment_error?.message,
      })

      // Update any associated booking
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("stripe_payment_intent", paymentIntent.id)
        .single()

      if (booking) {
        await supabase
          .from("bookings")
          .update({ payment_status: "failed" })
          .eq("id", booking.id)
      }
      break
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer
      logger.info("Transfer created", { transferId: transfer.id })
      break
    }

    case "payout.failed": {
      // A previously initiated payout to the host's bank account bounced.
      // Mark the payout row as failed so the host sees it in their dashboard
      // and can retry. Stripe will also notify them directly.
      const payout = event.data.object as Stripe.Payout
      logger.error("Stripe payout failed", {
        payoutId: payout.id,
        amount: payout.amount,
        failureCode: payout.failure_code,
        failureMessage: payout.failure_message,
      })
      await supabase
        .from("payouts")
        .update({ status: "failed" })
        .eq("stripe_payout_id", payout.id)
      break
    }

    case "charge.dispute.created": {
      // A renter filed a chargeback/dispute. Funds are held by Stripe; we
      // must flag the booking so the host and ops are aware before the
      // next payout runs.
      const dispute = event.data.object as Stripe.Dispute
      logger.error("Stripe dispute filed", {
        disputeId: dispute.id,
        chargeId: dispute.charge,
        amount: dispute.amount,
        reason: dispute.reason,
      })
      const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id
      if (chargeId) {
        // Look up the booking by its payment intent or session id via charge.
        // We may not have a direct mapping from charge_id — try paymentIntent.
        const stripeClient = getStripe()
        try {
          const charge = await stripeClient.charges.retrieve(chargeId)
          const paymentIntentId = typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id
          if (paymentIntentId) {
            await supabase
              .from("bookings")
              .update({
                requires_manual_payout_reversal: true,
                payment_status: "disputed",
              })
              .eq("stripe_payment_intent", paymentIntentId)
          }
        } catch (err) {
          logger.error("Failed to resolve dispute to booking", err)
        }
      }
      break
    }

    default:
      logger.info("Unhandled webhook event type", { type: event.type })
  }

  await supabase
    .from("processed_webhook_events")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("stripe_event_id", event.id)

  return NextResponse.json({ received: true })
  } catch (handlerError) {
    logger.error("Webhook handler failed after idempotency insert", { eventId: event.id, eventType: event.type, error: handlerError })
    await supabase
      .from("processed_webhook_events")
      .update({ status: "failed" })
      .eq("stripe_event_id", event.id)
    return NextResponse.json({ error: "Handler failed — will retry" }, { status: 500 })
  }
}
