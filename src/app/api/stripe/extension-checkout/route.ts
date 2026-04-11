import { SITE_URL } from "@/lib/seo"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  try {
    const { booking_id, extension_id } = await req.json()

    if (!booking_id || !extension_id) {
      return NextResponse.json({ error: "Missing booking_id or extension_id" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch extension WITHOUT sensitive user columns; those go via admin client below.
    const { data: extension, error: extensionError } = await supabase
      .from("booking_extensions")
      .select(`
        *,
        booking:bookings (
          studio:studios (title, host_id)
        )
      `)
      .eq("id", extension_id)
      .eq("booking_id", booking_id)
      .single()

    if (extensionError || !extension) {
      return NextResponse.json({ error: "Extension not found" }, { status: 404 })
    }

    if (extension.renter_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Admin client for sensitive user reads — migration 018 revokes these
    // columns from authenticated. Authorization already verified above.
    const admin = createAdminClient()

    const { data: renter } = await admin
      .from("users")
      .select("email, stripe_customer_id")
      .eq("id", user.id)
      .single()

    let customerId = renter?.stripe_customer_id

    if (!customerId && renter?.email) {
      const customer = await stripe.customers.create({
        email: renter.email,
        metadata: { user_id: extension.renter_id },
      })
      customerId = customer.id
      await admin.from("users").update({ stripe_customer_id: customerId }).eq("id", extension.renter_id)
    }

    const { data: host } = await admin
      .from("users")
      .select("stripe_account_id")
      .eq("id", extension.host_id)
      .single()

    const amountInCents = Math.round(extension.total_extension_price * 100)
    const platformFee = Math.round(amountInCents * 0.15)

    let useConnect = false
    if (host?.stripe_account_id) {
      try {
        const account = await stripe.accounts.retrieve(host.stripe_account_id)
        if (account.charges_enabled) useConnect = true
      } catch (err) {
        logger.warn("Failed to retrieve host Stripe account", { accountId: host.stripe_account_id, err })
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Verlenging: ${extension.booking?.studio?.title}`,
              description: `+${extension.extra_hours} uur`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${SITE_URL}/bookings/${booking_id}?extension_success=${extension_id}`,
      cancel_url: `${SITE_URL}/bookings/${booking_id}/extend?canceled=true`,
      metadata: {
        type: "extension_payment",
        booking_id,
        extension_id,
        user_id: user.id,
        platformFee: platformFee.toString(),
      },
      ...(useConnect && host?.stripe_account_id && {
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: { destination: host.stripe_account_id },
        },
      }),
    }, {
      idempotencyKey: `extension-${extension_id}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    logger.error("Extension checkout error", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}