import { createClient } from "@/lib/supabase/server"

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  price_per_day: number
  discount_percent: number
  description: string
  is_active: boolean
  created_at: string
}

export interface UserCredits {
  id: string
  user_id: string
  credits_remaining: number
  credits_total: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  type: "purchase" | "use" | "refund" | "expire"
  credits: number
  package_id: string | null
  booking_id: string | null
  stripe_session_id: string | null
  description: string
  created_at: string
}

// Get user's current credit balance
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found
    throw error
  }

  return data?.credits_remaining || 0
}

// Get user's full credit record
export async function getUserCreditsRecord(
  userId: string
): Promise<UserCredits | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw error
  }

  return data
}

// Add credits to user account (after purchase)
export async function addCredits(
  userId: string,
  credits: number,
  packageId: string,
  stripeSessionId: string
): Promise<number> {
  const supabase = await createClient()

  // Get existing credits
  const { data: existing } = await supabase
    .from("user_credits")
    .select("credits_remaining, credits_total")
    .eq("user_id", userId)
    .single()

  const newRemaining = (existing?.credits_remaining || 0) + credits
  const newTotal = (existing?.credits_total || 0) + credits

  // Upsert user credits
  const { error: upsertError } = await supabase.from("user_credits").upsert(
    {
      user_id: userId,
      credits_remaining: newRemaining,
      credits_total: newTotal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (upsertError) throw upsertError

  // Log transaction
  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "purchase",
    credits: credits,
    package_id: packageId,
    stripe_session_id: stripeSessionId,
    description: `Credit package purchased: ${credits} credits`,
  })

  if (txError) throw txError

  return newRemaining
}

// Use credits for a booking
export async function useCredits(
  userId: string,
  credits: number,
  bookingId: string
): Promise<number> {
  const supabase = await createClient()

  // Check if user has enough credits
  const { data: userCredits, error: fetchError } = await supabase
    .from("user_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .single()

  if (fetchError || !userCredits) {
    throw new Error("Geen credits gevonden")
  }

  if (userCredits.credits_remaining < credits) {
    throw new Error(
      `Niet genoeg credits. Je hebt ${userCredits.credits_remaining} credits, maar je hebt er ${credits} nodig.`
    )
  }

  // Deduct credits
  const newRemaining = userCredits.credits_remaining - credits

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({
      credits_remaining: newRemaining,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) throw updateError

  // Log transaction
  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "use",
    credits: -credits,
    booking_id: bookingId,
    description: `${credits} credit(s) gebruikt voor boeking`,
  })

  if (txError) throw txError

  return newRemaining
}

// Refund credits (e.g., cancelled booking)
export async function refundCredits(
  userId: string,
  credits: number,
  bookingId: string,
  reason: string
): Promise<number> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("user_credits")
    .select("credits_remaining")
    .eq("user_id", userId)
    .single()

  const newRemaining = (existing?.credits_remaining || 0) + credits

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({
      credits_remaining: newRemaining,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) throw updateError

  // Log transaction
  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "refund",
    credits: credits,
    booking_id: bookingId,
    description: `Refund: ${reason}`,
  })

  if (txError) throw txError

  return newRemaining
}

// Get all active credit packages
export async function getPackages(): Promise<CreditPackage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_packages")
    .select("*")
    .eq("is_active", true)
    .order("credits", { ascending: true })

  if (error) throw error
  return data || []
}

// Get a single package by ID
export async function getPackageById(
  packageId: string
): Promise<CreditPackage | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_packages")
    .select("*")
    .eq("id", packageId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw error
  }

  return data
}

// Get user's credit transaction history
export async function getCreditTransactions(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Check if user has enough credits
export async function hasEnoughCredits(
  userId: string,
  required: number
): Promise<boolean> {
  const credits = await getUserCredits(userId)
  return credits >= required
}
