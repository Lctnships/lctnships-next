import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// DELETE /api/sessions/[id] - Remove a session (logout device)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("user_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    logger.error("Error deleting session", error, { route: "DELETE /api/sessions/[id]" })
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
