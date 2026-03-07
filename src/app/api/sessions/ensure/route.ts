import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { parseUserAgent } from "@/lib/utils/parse-user-agent"

// POST /api/sessions/ensure - Ensure the current device has a session
// Creates one if the user has no sessions at all (e.g. logged in before tracking existed)
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user already has any sessions
  const { count } = await supabase
    .from("user_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (count && count > 0) {
    return NextResponse.json({ exists: true })
  }

  // No sessions exist - register the current one
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                    headersList.get("x-real-ip") || null

  const parsed = parseUserAgent(userAgent)

  const { data: session, error } = await supabase.from("user_sessions").insert({
    user_id: user.id,
    device_name: parsed.deviceName,
    device_type: parsed.deviceType,
    browser: `${parsed.browser} on ${parsed.os}`,
    os: parsed.os,
    ip_address: ipAddress,
    user_agent: userAgent.slice(0, 500),
    is_current: true,
  }).select().single()

  if (error) {
    console.error("Error ensuring session:", error)
    return NextResponse.json({ error: "Failed to ensure session" }, { status: 500 })
  }

  return NextResponse.json({
    created: true,
    session: {
      id: session.id,
      name: session.device_name,
      type: session.device_type,
      location: session.ip_address || "Unknown",
      browser: session.browser,
      isCurrent: true,
    },
  })
}
