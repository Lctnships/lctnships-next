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

  let ics = [
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
      const renterName = (booking.renter as any)?.full_name || "Guest"
      const summary = escapeICS(`Booking: ${renterName}`)
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
      const summary = escapeICS(blocked.reason ? `Blocked: ${blocked.reason}` : "Blocked")

      ics.push(
        "BEGIN:VEVENT",
        `UID:blocked-${blocked.id}@lctnships.com`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
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
      "Content-Disposition": `attachment; filename="${studio.title || "calendar"}.ics"`,
    },
  })
}
