import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET /api/sessions - List all sessions for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: sessions, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false })

  if (error) {
    logger.error("Error fetching sessions", error, { route: "GET /api/sessions" })
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}

// POST /api/sessions - Create a new session (called from auth callback)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const { error } = await supabase.from("user_sessions").insert({
    user_id: user.id,
    device_name: body.device_name,
    device_type: body.device_type,
    browser: body.browser,
    os: body.os,
    ip_address: body.ip_address || null,
    location: body.location || null,
    user_agent: body.user_agent,
    is_current: true,
  })

  if (error) {
    logger.error("Error creating session", error, { route: "POST /api/sessions" })
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
