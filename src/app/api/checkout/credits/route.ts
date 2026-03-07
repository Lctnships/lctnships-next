import { NextRequest, NextResponse } from "next/server"
import { createCreditPurchase } from "@/lib/stripe"
import { getPackageById } from "@/lib/credits"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", user.id)
      .single()

    const customerEmail = profile?.email || user.email

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Customer email required" },
        { status: 400 }
      )
    }

    // Get package details
    const pkg = await getPackageById(packageId)

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    if (!pkg.is_active) {
      return NextResponse.json(
        { error: "This package is no longer available" },
        { status: 400 }
      )
    }

    // Create Stripe checkout session for credits
    const session = await createCreditPurchase({
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      discountPercent: pkg.discount_percent,
      userId: user.id,
      customerEmail,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: unknown) {
    console.error("Credits checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
