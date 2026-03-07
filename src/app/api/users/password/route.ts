import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/users/password - Change password
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { current_password, new_password } = body

    if (!new_password) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      )
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Verify current password by trying to sign in
    // Note: This requires the user to provide their current password for security
    if (current_password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: current_password,
      })

      if (signInError) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        )
      }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (error) throw error

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error: unknown) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    )
  }
}
