import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET /api/users/settings - Get user settings
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin client for notification/security prefs — authenticated cannot SELECT these.
    const admin = createAdminClient()
    const { data: settings, error } = await admin
      .from("users")
      .select(`
        email_notifications,
        sms_notifications,
        push_notifications,
        marketing_emails,
        two_factor_enabled
      `)
      .eq("id", user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ settings })
  } catch (error: unknown) {
    logger.error("Error fetching settings", error, { route: "GET /api/users/settings" })
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// PATCH /api/users/settings - Update user settings
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // List of allowed settings to update
    const allowedFields = [
      "email_notifications",
      "sms_notifications",
      "push_notifications",
      "marketing_emails",
      "two_factor_enabled",
    ]

    // Filter to only allowed fields
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    // Admin client writes the updated settings.
    const admin = createAdminClient()
    const { error } = await admin
      .from("users")
      .update(updateData)
      .eq("id", user.id)

    if (error) throw error

    // Fetch updated settings separately to avoid .single() coercion issues
    const { data: settings, error: fetchError } = await admin
      .from("users")
      .select(`
        email_notifications,
        sms_notifications,
        push_notifications,
        marketing_emails,
        two_factor_enabled
      `)
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) throw fetchError

    return NextResponse.json({ settings })
  } catch (error: unknown) {
    logger.error("Error updating settings", error, { route: "PATCH /api/users/settings" })
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
