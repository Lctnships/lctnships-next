import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserCredits, getCreditTransactions, getPackages } from "@/lib/credits"
import { logger } from "@/lib/logger"

// GET /api/credits - Get user's credits and available packages
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user credits and packages in parallel
    const [credits, packages, transactions] = await Promise.all([
      getUserCredits(user.id),
      getPackages(),
      getCreditTransactions(user.id, 20),
    ])

    return NextResponse.json({
      credits,
      packages,
      transactions,
    })
  } catch (error: unknown) {
    logger.error("Error fetching credits", error)
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    )
  }
}
