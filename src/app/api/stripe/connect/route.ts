import { SITE_URL } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe/config"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// POST /api/stripe/connect - Create Stripe Connect account and onboarding link
export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin client for sensitive user fields (stripe_account_id, email).
    // Authorization already verified via getUser() above.
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("users")
      .select("stripe_account_id, full_name, email")
      .eq("id", user.id)
      .single()

    let accountId = profile?.stripe_account_id

    // Create Stripe Connect account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "NL", // Default to Netherlands
        email: profile?.email || user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          name: profile?.full_name || undefined,
          product_description: "Creative studio rentals and equipment",
        },
      })

      accountId = account.id

      // Save account ID via admin client (authenticated cannot write stripe_account_id)
      await admin
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id)
    }

    // Create onboarding link
    const appUrl = SITE_URL
    const { searchParams } = new URL(request.url)

    // Validate redirect URLs against app domain to prevent open-redirect attacks
    const validateRedirectUrl = (url: string | null, fallback: string): string => {
      if (!url) return fallback
      try {
        const parsed = new URL(url)
        const appOrigin = new URL(appUrl).origin
        if (parsed.origin !== appOrigin) return fallback
        return url
      } catch {
        return fallback
      }
    }

    const returnUrl = validateRedirectUrl(
      searchParams.get("returnUrl"),
      `${appUrl}/host/payouts`
    )
    const refreshUrl = validateRedirectUrl(
      searchParams.get("refreshUrl"),
      `${appUrl}/host/payouts?refresh=true`
    )

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    })
  } catch (error: unknown) {
    logger.error("Error creating Stripe Connect account", error)
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    )
  }
}

// GET /api/stripe/connect - Get Stripe account status
export async function GET(_request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      defaultCurrency: account.default_currency,
    })
  } catch (error: unknown) {
    logger.error("Error getting Stripe account status", error)
    return NextResponse.json(
      { error: "Failed to get Stripe account status" },
      { status: 500 }
    )
  }
}
