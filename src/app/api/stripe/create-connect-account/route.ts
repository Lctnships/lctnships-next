import { SITE_URL } from "@/lib/seo"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

    // Admin client for sensitive user fields — migration 018 blocks
    // authenticated from reading email/stripe_account_id directly.
    const admin = createAdminClient()
    const { data: profile } = await admin
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

    // Atomic link via admin client: only write stripe_account_id if it is
    // still NULL. If a concurrent request already linked a different account,
    // this UPDATE returns zero rows and we delete the orphan we just created.
    // Migration 016 adds a UNIQUE constraint as second line of defense.
    const { data: claimed, error: claimError } = await admin
      .from("users")
      .update({
        stripe_account_id: account.id,
        user_type: "both",
      })
      .eq("id", user.id)
      .is("stripe_account_id", null)
      .select("stripe_account_id")
      .single()

    if (claimError || !claimed) {
      // Another request already linked an account. Clean up the orphan.
      try {
        await stripe.accounts.del(account.id)
        logger.warn("Deleted orphan Stripe account from lost race", {
          userId: user.id,
          orphanAccountId: account.id,
        })
      } catch (deleteErr) {
        logger.error("Failed to delete orphan Stripe account", {
          orphanAccountId: account.id,
          error: deleteErr,
        })
      }

      // Re-read the account we lost the race to and return onboarding link
      const { data: existingProfile } = await admin
        .from("users")
        .select("stripe_account_id")
        .eq("id", user.id)
        .single()

      if (!existingProfile?.stripe_account_id) {
        return NextResponse.json(
          { error: "Could not link Stripe account. Please try again." },
          { status: 500 },
        )
      }

      const accountLink = await stripe.accountLinks.create({
        account: existingProfile.stripe_account_id,
        refresh_url: `${SITE_URL}/host/dashboard?stripe=refresh`,
        return_url: `${SITE_URL}/host/dashboard?stripe=success`,
        type: "account_onboarding",
      })
      return NextResponse.json({ url: accountLink.url })
    }

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
