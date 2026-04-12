import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database.types"
import { logger } from "@/lib/logger"

type UserInsert = Database["public"]["Tables"]["users"]["Insert"]

// Columns that exist on the users table today. Keep this in sync with the
// database.types.ts Row type — the following were previously in this file
// but DO NOT EXIST in the DB and caused the GET handler to 500:
// professional_title, response_rate, response_time, equipment_preferences,
// is_accepting_projects.
const PROFILE_COLUMNS = `
  id, full_name, email, avatar_url, bio, location, phone,
  user_type, is_verified, created_at, updated_at, two_factor_enabled
`

// GET /api/users/profile - Get current user's profile.
// Uses the admin client because phone, email and two_factor_enabled are
// blocked from the authenticated role via column grants (migration 018).
// User identity is verified first via getUser() on the user-scoped client.
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const { data: profile, error } = await adminSupabase
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    logger.error("Error fetching profile", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PATCH /api/users/profile - Update current user's profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // List of allowed fields to update
    const allowedFields = [
      "full_name",
      "phone",
      "bio",
      "location",
      "avatar_url",
    ]

    // Filter to only allowed fields
    const updateData: Partial<UserInsert> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field]
      }
    }

    // Validate avatar_url — must be HTTPS pointing to trusted image hosts
    if (updateData.avatar_url) {
      try {
        const avatarUrl = new URL(updateData.avatar_url as string)
        const trustedHosts = [
          "lh3.googleusercontent.com",
          "graph.facebook.com",
          "avatars.githubusercontent.com",
          process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "",
        ].filter(Boolean)
        if (avatarUrl.protocol !== "https:" || !trustedHosts.some(h => avatarUrl.hostname.endsWith(h))) {
          return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 })
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    // Use admin client to bypass RLS — user identity already verified above
    const adminSupabase = createAdminClient()
    const upsertData: UserInsert = {
      id: user.id,
      email: user.email!,
      ...updateData,
    }
    const { data: rows, error } = await adminSupabase
      .from("users")
      .upsert(upsertData, { onConflict: "id" })
      .select(PROFILE_COLUMNS)

    if (error) throw error

    return NextResponse.json({ profile: rows?.[0] ?? null })
  } catch (error: unknown) {
    logger.error("Error updating profile", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
