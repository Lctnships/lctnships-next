import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { encrypt, decrypt, isEncrypted } from "@/lib/encryption"
import { logger } from "@/lib/logger"

// GET /api/users/bank-account - Get user's bank account details
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin client for bank_* columns — migration 018 revokes from authenticated.
    const admin = createAdminClient()
    const { data: bankAccount, error } = await admin
      .from("users")
      .select(`
        bank_account_name,
        bank_iban,
        bank_bic
      `)
      .eq("id", user.id)
      .single()

    if (error) throw error

    // Decrypt IBAN if it's encrypted, then mask for display
    const rawIban = bankAccount?.bank_iban
    let maskedIban: string | null = null
    if (rawIban) {
      const decryptedIban = isEncrypted(rawIban) ? decrypt(rawIban) : rawIban
      maskedIban = decryptedIban ? `****${decryptedIban.slice(-4)}` : null
    }

    // Decrypt BIC if it's encrypted
    const rawBic = bankAccount?.bank_bic
    const decryptedBic = rawBic
      ? isEncrypted(rawBic) ? decrypt(rawBic) : rawBic
      : null

    return NextResponse.json({
      bank_account: {
        name: bankAccount?.bank_account_name,
        iban_masked: maskedIban,
        bic: decryptedBic,
        has_bank_details: !!(bankAccount?.bank_iban && bankAccount?.bank_account_name),
      },
    })
  } catch (error: unknown) {
    logger.error("Error fetching bank account", error, { route: "GET /api/users/bank-account" })
    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: 500 }
    )
  }
}

// POST /api/users/bank-account - Save bank account details
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { account_name, iban, bic } = body

    if (!account_name || !iban) {
      return NextResponse.json(
        { error: "Account name and IBAN are required" },
        { status: 400 }
      )
    }

    // Basic IBAN validation (simplified)
    const cleanIban = iban.replace(/\s/g, "").toUpperCase()
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      return NextResponse.json(
        { error: "Invalid IBAN format" },
        { status: 400 }
      )
    }

    // Encrypt IBAN before storing
    const encryptedIban = encrypt(cleanIban)

    // Encrypt BIC before storing (if provided)
    const encryptedBic = bic ? encrypt(bic.toUpperCase().trim()) : null

    // Admin client for bank column writes — authenticated cannot update them.
    const admin = createAdminClient()
    const { data: bankAccount, error } = await admin
      .from("users")
      .update({
        bank_account_name: account_name,
        bank_iban: encryptedIban,
        bank_bic: encryptedBic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select(`
        bank_account_name,
        bank_iban,
        bank_bic
      `)
      .single()

    if (error) throw error

    // Decrypt BIC from returned data for response
    const returnedBic = bankAccount?.bank_bic
    const responseBic = returnedBic
      ? isEncrypted(returnedBic) ? decrypt(returnedBic) : returnedBic
      : null

    return NextResponse.json({
      message: "Bank account saved successfully",
      bank_account: {
        name: bankAccount?.bank_account_name,
        iban_masked: `****${cleanIban.slice(-4)}`,
        bic: responseBic,
      },
    })
  } catch (error: unknown) {
    logger.error("Error saving bank account", error, { route: "POST /api/users/bank-account" })
    return NextResponse.json(
      { error: "Failed to save bank account" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/bank-account - Remove bank account details
export async function DELETE(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("users")
      .update({
        bank_account_name: null,
        bank_iban: null,
        bank_bic: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    return NextResponse.json({ message: "Bank account removed successfully" })
  } catch (error: unknown) {
    logger.error("Error removing bank account", error, { route: "DELETE /api/users/bank-account" })
    return NextResponse.json(
      { error: "Failed to remove bank account" },
      { status: 500 }
    )
  }
}
