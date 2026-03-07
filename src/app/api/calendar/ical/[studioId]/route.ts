import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studioId: string }> }
) {
  const { studioId } = await params
  const supabase = await createClient()

  // Authenticate: only the studio owner can access the calendar feed
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Also support token-based access via query parameter for calendar apps
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Provide authentication or a valid token." }, { status: 401 })
    }
    // Verify token matches the studio's ical_token
    const { data: studioToken } = await supabase
      .from("studios")
      .select("ical_token")
      .eq("id", studioId)
      .single()

    if (!studioToken || studioToken.ical_token !== token) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 })
    }
  } else {
    // Verify the authenticated user owns this studio
    const { data: ownership } = await supabase
      .from("studios")
      .select("id")
      .eq("id", studioId)
      .eq("host_id", user.id)
      .single()

    if (!ownership) {
      return NextResponse.json({ error: "Forbidden: you do not own this studio" }, { status: 403 })
    }
  }

  // Fetch studio info
  const { data: studio } = await supabase
    .from("studios")
    .select("id, title, location")
    .eq("id", studioId)
    .single()

  if (!studio) {
    return NextResponse.json({ error: "Studio not found" }, { status: 404 })
  }

  // Fetch confirmed/completed bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_datetime, end_datetime, status, renter:users!bookings_renter_id_fkey(full_name)")
    .eq("studio_id", studioId)
    .in("status", ["confirmed", "completed", "pending"])
    .order("start_datetime")

  // Fetch blocked dates
  const { data: blockedDates } = await supabase
    .from("studio_blocked_dates")
    .select("id, blocked_date, reason")
    .eq("studio_id", studioId)
    .order("blocked_date")

  const now = formatICSDate(new Date())
  const calName = escapeICS(`${studio.title} - LCTNSHIPS`)

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LCTNSHIPS//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
  ]

  // Add booking events
  if (bookings) {
    for (const booking of bookings) {
      const start = formatICSDate(new Date(booking.start_datetime))
      const end = formatICSDate(new Date(booking.end_datetime))
      const renterName = (booking.renter as { full_name?: string } | null)?.full_name || "Guest"
      const summary = escapeICS(`Booking - ${renterName}`)
      const description = escapeICS(`Status: ${booking.status}\\nStudio: ${studio.title}`)
      const location = studio.location ? escapeICS(studio.location) : ""

      ics.push(
        "BEGIN:VEVENT",
        `UID:booking-${booking.id}@lctnships.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        ...(location ? [`LOCATION:${location}`] : []),
        `STATUS:${booking.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
        "END:VEVENT"
      )
    }
  }

  // Add blocked date events
  if (blockedDates) {
    for (const blocked of blockedDates) {
      const dateStr = blocked.blocked_date.replace(/-/g, "")
      // ICS all-day DTEND is exclusive, so add one day
      const endDate = new Date(blocked.blocked_date)
      endDate.setDate(endDate.getDate() + 1)
      const endDateStr = endDate.toISOString().split("T")[0].replace(/-/g, "")
      const summary = escapeICS(blocked.reason ? `Geblokkeerd: ${blocked.reason}` : "Geblokkeerd")

      ics.push(
        "BEGIN:VEVENT",
        `UID:blocked-${blocked.id}@lctnships.com`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${endDateStr}`,
        `SUMMARY:${summary}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT"
      )
    }
  }

  ics.push("END:VCALENDAR")

  return new NextResponse(ics.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="studio-calendar.ics"`,
    },
  })
}
