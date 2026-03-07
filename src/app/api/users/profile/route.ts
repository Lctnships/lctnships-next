import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET /api/users/profile - Get current user's profile
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
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
    const updateData: Record<string, any> = {}
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

    // Use admin client to bypass RLS — user identity already verified above
    const adminSupabase = createAdminClient()
    const upsertData = {
      id: user.id,
      email: user.email!,
      ...updateData,
    }
    const { data: rows, error } = await adminSupabase
      .from("users")
      .upsert(upsertData as any, { onConflict: "id" })
      .select()

    if (error) throw error

    return NextResponse.json({ profile: rows?.[0] ?? null })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}
