import { SITE_URL } from "@/lib/seo"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("email, stripe_account_id")
      .eq("id", user.id)
      .single()

    // Check if user already has a Stripe account
    if (profile?.stripe_account_id) {
      // Create account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripe_account_id,
        refresh_url: `${SITE_URL}/host/dashboard?stripe=refresh`,
        return_url: `${SITE_URL}/host/dashboard?stripe=success`,
        type: "account_onboarding",
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Create new Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "NL",
      email: profile?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        ideal_payments: { requested: true },
      },
      business_type: "individual",
      metadata: {
        user_id: user.id,
      },
    })

    // Save account ID to user
    await supabase
      .from("users")
      .update({
        stripe_account_id: account.id,
        user_type: "both", // Upgrade to host
      })
      .eq("id", user.id)

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${SITE_URL}/host/dashboard?stripe=refresh`,
      return_url: `${SITE_URL}/host/dashboard?stripe=success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: unknown) {
    logger.error("Connect account error", error)
    return NextResponse.json({ error: "Connect account error" }, { status: 500 })
  }
}
