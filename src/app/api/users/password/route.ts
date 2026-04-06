import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

    // Current password is required for security
    if (!current_password) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      )
    }

    if (!new_password) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      )
    }

    if (new_password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      )
    }

    // Require at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/
    if (!passwordRegex.test(new_password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" },
        { status: 400 }
      )
    }

    // Verify current password by trying to sign in
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

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (error) throw error

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error: unknown) {
    logger.error("Error changing password", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
