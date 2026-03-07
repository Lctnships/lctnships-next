import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { encrypt, decrypt, isEncrypted } from "@/lib/encryption"

// GET /api/users/bank-account - Get user's bank account details
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: bankAccount, error } = await supabase
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

    return NextResponse.json({
      bank_account: {
        name: bankAccount?.bank_account_name,
        iban_masked: maskedIban,
        bic: bankAccount?.bank_bic,
        has_bank_details: !!(bankAccount?.bank_iban && bankAccount?.bank_account_name),
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching bank account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bank account" },
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

    const { data: bankAccount, error } = await supabase
      .from("users")
      .update({
        bank_account_name: account_name,
        bank_iban: encryptedIban,
        bank_bic: bic || null,
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

    return NextResponse.json({
      message: "Bank account saved successfully",
      bank_account: {
        name: bankAccount?.bank_account_name,
        iban_masked: `****${cleanIban.slice(-4)}`,
        bic: bankAccount?.bank_bic,
      },
    })
  } catch (error: unknown) {
    console.error("Error saving bank account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save bank account" },
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

    const { error } = await supabase
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
    console.error("Error removing bank account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove bank account" },
      { status: 500 }
    )
  }
}
