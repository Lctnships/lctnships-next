import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const studioId = request.nextUrl.searchParams.get("studio_id")
  if (!studioId) return NextResponse.json({ error: "studio_id required" }, { status: 400 })

  const { data, error } = await supabase
    .from("studio_blocked_dates")
    .select("*")
    .eq("studio_id", studioId)
    .order("blocked_date", { ascending: true })

  if (error) {
    logger.error("Error fetching blocked dates", error)
    return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 })
  }

  return NextResponse.json({ blockedDates: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { studio_id, start_date, end_date, reason } = body

  if (!studio_id || !start_date) {
    return NextResponse.json({ error: "studio_id and start_date required" }, { status: 400 })
  }

  // Verify user owns the studio
  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("id", studio_id)
    .eq("host_id", user.id)
    .single()

  if (!studio) return NextResponse.json({ error: "Studio not found" }, { status: 404 })

  // Generate dates in range
  const start = new Date(start_date)
  const end = new Date(end_date || start_date)
  const dates: { studio_id: string; blocked_date: string; reason?: string }[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push({
      studio_id,
      blocked_date: d.toISOString().split("T")[0],
      ...(reason ? { reason } : {}),
    })
  }

  const { data, error } = await supabase
    .from("studio_blocked_dates")
    .upsert(dates, { onConflict: "studio_id,blocked_date" })
    .select()

  if (error) {
    logger.error("Error saving blocked dates", error)
    return NextResponse.json({ error: "Failed to save blocked dates" }, { status: 500 })
  }

  return NextResponse.json({ blockedDates: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = request.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  // Verify ownership via join
  const { data: blockedDate } = await supabase
    .from("studio_blocked_dates")
    .select("id, studio:studios!inner(host_id)")
    .eq("id", id)
    .single()

  if (!blockedDate || (blockedDate.studio as unknown as { host_id: string } | null)?.host_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("studio_blocked_dates")
    .delete()
    .eq("id", id)

  if (error) {
    logger.error("Error deleting blocked date", error)
    return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
