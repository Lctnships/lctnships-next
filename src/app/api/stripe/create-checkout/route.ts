import { SITE_URL } from "@/lib/seo"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  try {
    const { bookingId } = await req.json()

    const supabase = await createClient()

    // Authenticate the user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (title, host_id, hourly_rate, price_per_hour),
        renter:users!bookings_renter_id_fkey (email, stripe_customer_id)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify the authenticated user is the renter of this booking
    if (booking.renter_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: you are not the renter of this booking" }, { status: 403 })
    }

    // Get or create Stripe customer
    let customerId = booking.renter?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: booking.renter?.email,
        metadata: {
          user_id: booking.renter_id,
        },
      })
      customerId = customer.id

      // Save customer ID to user
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", booking.renter_id)
    }

    // Get host's Stripe account for Connect
    const { data: host } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", booking.studio?.host_id)
      .single()

    // Server-side price recalculation — never trust DB amount (renter could PATCH via Supabase REST)
    const hourlyRate = booking.studio?.hourly_rate || booking.studio?.price_per_hour || 0
    const recalculatedAmount = Math.round(booking.total_hours * hourlyRate * 100) // cents
    const platformFee = Math.round(recalculatedAmount * 0.15)

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Boeking: ${booking.studio?.title}`,
              description: `${booking.total_hours} uur - ${new Date(booking.start_datetime).toLocaleDateString("nl-NL")}`,
            },
            unit_amount: recalculatedAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${SITE_URL}/bookings/${bookingId}?success=true`,
      cancel_url: `${SITE_URL}/bookings/${bookingId}?canceled=true`,
      metadata: {
        booking_id: bookingId,
      },
      // If host has Stripe Connect, use transfer with server-calculated fee
      ...(host?.stripe_account_id && {
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: host.stripe_account_id,
          },
        },
      }),
    }, {
      idempotencyKey: `checkout-${bookingId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    logger.error("Checkout error", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
