import { NextRequest, NextResponse } from "next/server"
import { getStripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingId,
      studioId,
      hours,
      date,
      startTime,
      totalAmount, // Client-sent total for tolerance check only
    } = body

    // Validate required fields
    if (!studioId || !hours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get studio details (no users join — host stripe_account_id via admin client).
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select(`
        id,
        title,
        host_id,
        hourly_rate
      `)
      .eq("id", studioId)
      .single()

    if (studioError || !studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

    // Server-side price recalculation to prevent client-side price manipulation.
    // Compute in cents in a single step — never go through an intermediate euro
    // rounding, which would be lossy and could make platform_fee differ from
    // what the webhook records.
    const hourlyRate = studio.hourly_rate || 0
    const amountInCents = Math.round(hourlyRate * hours * 100)

    // Verify client-supplied total is within acceptable tolerance (2% for rounding)
    if (totalAmount) {
      const clientCents = Math.round(totalAmount * 100)
      const toleranceCents = Math.max(1, Math.ceil(amountInCents * 0.02))
      if (Math.abs(amountInCents - clientCents) > toleranceCents) {
        return NextResponse.json(
          { error: "Price mismatch detected. Please refresh and try again." },
          { status: 400 }
        )
      }
    }

    const email = user.email

    // Fetch host's stripe_account_id via admin client — cross-user read
    // of a sensitive column that migration 018 blocks from authenticated.
    const admin = createAdminClient()
    const { data: studioOwner } = await admin
      .from("users")
      .select("stripe_account_id")
      .eq("id", studio.host_id)
      .single()
    const studioOwnerStripeId = studioOwner?.stripe_account_id

    // Verify the host's Stripe Connect account is actually able to receive
    // charges before we build the session with transfer_data. If not, we fall
    // through to the platform-holds-funds path and log the host for manual
    // follow-up — this prevents failing checkouts at pay time due to a host
    // whose onboarding lapsed or account was restricted.
    const stripe = getStripe()
    let useConnect = false
    if (studioOwnerStripeId) {
      try {
        const account = await stripe.accounts.retrieve(studioOwnerStripeId)
        if (account.charges_enabled) {
          useConnect = true
        } else {
          logger.warn("Host Stripe account not ready for charges, falling back to platform flow", {
            hostId: studio.host_id,
            accountId: studioOwnerStripeId,
            chargesEnabled: account.charges_enabled,
            detailsSubmitted: account.details_submitted,
          })
        }
      } catch (err) {
        logger.warn("Failed to retrieve host Stripe account", { accountId: studioOwnerStripeId, err })
      }
    }

    const origin = request.nextUrl.origin
    const effectiveBookingId = bookingId || `temp_${Date.now()}`
    const successUrl = `${origin}/book/${studioId}/success?booking=${effectiveBookingId}&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/book/${studioId}/checkout?date=${date || ""}&start=${startTime || ""}&duration=${hours}`

    // If studio owner has an active Stripe Connect account, use commission flow
    if (useConnect && studioOwnerStripeId) {
      const applicationFee = Math.round(amountInCents * (PLATFORM_FEE_PERCENT / 100))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "ideal", "sepa_debit", "bancontact"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Boeking: ${studio.title}`,
                description: `${hours} uur${date ? ` op ${date}` : ""}${startTime ? ` om ${startTime}` : ""}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFee,
          transfer_data: {
            destination: studioOwnerStripeId,
          },
        },
        metadata: {
          type: "booking_payment",
          bookingId: effectiveBookingId,
          studioId,
          studioOwnerId: studioOwnerStripeId,
          platformFee: applicationFee.toString(),
          hours: hours.toString(),
          date: date || "",
          startTime: startTime || "",
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      // Update booking with session ID + overwrite financial columns with
      // server-recalculated values. The client originally inserted these
      // columns from its own math, which is untrusted — here we correct the
      // row so the DB matches what the renter actually pays via Stripe.
      // This requires the service role because migration 011 blocks
      // authenticated users from touching financial columns on bookings.
      if (bookingId) {
        const adminSupabase = await createServiceClient()
        const hostPayoutCents = amountInCents - applicationFee
        await adminSupabase
          .from("bookings")
          .update({
            stripe_session_id: session.id,
            payment_status: "pending",
            total_amount: amountInCents / 100,
            service_fee: applicationFee / 100,
            host_payout: hostPayoutCents / 100,
          })
          .eq("id", bookingId)
      }

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        platformFee: PLATFORM_FEE_PERCENT,
      })
    }

    // Fallback: no Connect account or charges not enabled — platform holds funds
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal", "sepa_debit", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Boeking: ${studio.title}`,
              description: `${hours} uur${date ? ` op ${date}` : ""}${startTime ? ` om ${startTime}` : ""}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "booking_payment",
        bookingId: effectiveBookingId,
        studioId,
        hours: hours.toString(),
        date: date || "",
        startTime: startTime || "",
      },
    })

    // Update booking with session ID + overwrite financial columns with
    // server-recalculated values. Same rationale as the Connect path above.
    if (bookingId) {
      const adminSupabase = await createServiceClient()
      await adminSupabase
        .from("bookings")
        .update({
          stripe_session_id: session.id,
          payment_status: "pending",
          total_amount: amountInCents / 100,
        })
        .eq("id", bookingId)
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    logger.error("Stripe checkout error", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
