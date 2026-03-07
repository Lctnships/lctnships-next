import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { addCredits } from "@/lib/credits"
import { createServiceClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
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
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Use service client for webhook operations (elevated permissions)
  const supabase = await createServiceClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentType = session.metadata?.type

      console.log("Checkout completed:", {
        sessionId: session.id,
        type: paymentType,
        amountTotal: session.amount_total,
      })

      // Handle credit purchase
      if (paymentType === "credit_purchase") {
        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const credits = parseInt(session.metadata?.credits || "0")

        if (userId && packageId && credits > 0) {
          try {
            await addCredits(userId, credits, packageId, session.id)
            console.log(`Added ${credits} credits for user ${userId}`)

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
            console.error("Failed to add credits:", error)
          }
        }
      }
      // Handle booking payment
      else if (paymentType === "booking_payment" || session.metadata?.bookingId) {
        const bookingId = session.metadata?.bookingId
        const platformFee = parseInt(session.metadata?.platformFee || "0")

        if (bookingId && bookingId !== "" && !bookingId.startsWith("temp_")) {
          try {
            // Update booking status
            await supabase
              .from("bookings")
              .update({
                status: "confirmed",
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
              await supabase.from("notifications").insert({
                user_id: booking.host_id,
                type: "payment_received",
                title: "Payment received",
                message: `Payment received for ${(booking.studio as { title?: string } | null)?.title}`,
                link: `/host/bookings/${bookingId}`,
              })
            }

            console.log(`Booking ${bookingId} confirmed with payment`)
          } catch (error) {
            console.error("Failed to update booking:", error)
          }
        } else {
          // Log standalone payment (no booking ID)
          console.log("Payment received without booking:", {
            sessionId: session.id,
            studioId: session.metadata?.studioId,
            amount: session.amount_total,
          })
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

      console.log("Checkout session expired:", session.id)
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error?.message)

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
      console.log("Transfer created:", {
        id: transfer.id,
        amount: transfer.amount,
        destination: transfer.destination,
      })
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
