import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  try {
    const { bookingId } = await req.json()

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (title, host_id),
        renter:users!bookings_renter_id_fkey (email, stripe_customer_id)
      `)
      .eq("id", bookingId)
      .eq("renter_id", user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "Booking is already paid" }, { status: 400 })
    }
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is cancelled" }, { status: 400 })
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

    // Get host's Stripe account for Connect. Only route the payment through
    // Connect when the account can actually accept charges — a destination
    // charge to a half-onboarded account makes session creation fail.
    const { data: host } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", booking.studio?.host_id)
      .single()

    let hostChargesEnabled = false
    if (host?.stripe_account_id) {
      try {
        const account = await stripe.accounts.retrieve(host.stripe_account_id)
        hostChargesEnabled = account.charges_enabled === true
      } catch (accountError) {
        console.error("Could not retrieve host Stripe account:", accountError)
      }
    }

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
            unit_amount: Math.round(booking.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}?canceled=true`,
      metadata: {
        booking_id: bookingId,
      },
      // If host has an active Stripe Connect account, route via destination
      // charge. Platform keeps total - host_payout (service fee + commission),
      // not just the service fee.
      ...(hostChargesEnabled && host?.stripe_account_id && {
        payment_intent_data: {
          application_fee_amount: Math.round(
            (booking.total_amount - booking.host_payout) * 100
          ),
          transfer_data: {
            destination: host.stripe_account_id,
          },
        },
      }),
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
