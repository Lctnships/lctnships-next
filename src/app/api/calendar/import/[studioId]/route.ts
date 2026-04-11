import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ studioId: string }>
}

function parseICS(icsContent: string): { start: Date; end: Date; summary: string }[] {
  const events: { start: Date; end: Date; summary: string }[] = []
  const lines = icsContent.split(/\r?\n/)
  
  let currentEvent: Partial<{ start: string; end: string; summary: string }> = {}
  let inEvent = false
  
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true
      currentEvent = {}
    } else if (line === "END:VEVENT") {
      inEvent = false
      if (currentEvent.start && currentEvent.end) {
        events.push({
          start: parseICSDate(currentEvent.start),
          end: parseICSDate(currentEvent.end),
          summary: currentEvent.summary || "External Event"
        })
      }
    } else if (inEvent) {
      if (line.startsWith("DTSTART")) {
        const match = line.match(/DTSTART(?::|;VALUE=):?(.+)$/)
        if (match) currentEvent.start = match[1]
      } else if (line.startsWith("DTEND")) {
        const match = line.match(/DTEND(?::|;VALUE=):?(.+)$/)
        if (match) currentEvent.end = match[1]
      } else if (line.startsWith("SUMMARY")) {
        const match = line.match(/SUMMARY:(.+)$/)
        if (match) currentEvent.summary = match[1]
      }
    }
  }
  
  return events
}

function parseICSDate(dateStr: string): Date {
  if (dateStr.includes("T")) {
    const cleanDate = dateStr.replace(/[-:]/g, "").replace(/\.\d{3}/, "")
    const year = parseInt(cleanDate.substring(0, 4))
    const month = parseInt(cleanDate.substring(4, 6)) - 1
    const day = parseInt(cleanDate.substring(6, 8))
    const hour = parseInt(cleanDate.substring(9, 11)) || 0
    const minute = parseInt(cleanDate.substring(11, 13)) || 0
    return new Date(Date.UTC(year, month, day, hour, minute))
  } else {
    const cleanDate = dateStr.replace(/-/g, "")
    const year = parseInt(cleanDate.substring(0, 4))
    const month = parseInt(cleanDate.substring(4, 6)) - 1
    const day = parseInt(cleanDate.substring(6, 8))
    return new Date(Date.UTC(year, month, day))
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { studioId } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: studio } = await supabase
      .from("studios")
      .select("host_id, wix_calendar_url")
      .eq("id", studioId)
      .single()

    if (!studio || studio.host_id !== user.id) {
      return NextResponse.json({ error: "Studio not found or unauthorized" }, { status: 404 })
    }

    const body = await request.json()
    const { ical_url } = body

    if (!ical_url) {
      return NextResponse.json({ error: "iCal URL is required" }, { status: 400 })
    }

    // Validate URL
    if (!ical_url.startsWith("http://") && !ical_url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the iCal feed
    let icsContent: string
    try {
      const response = await fetch(ical_url, {
        headers: {
          "User-Agent": "LCTNSHIPS/1.0",
        },
      })

      if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch iCal feed" }, { status: 400 })
      }

      icsContent = await response.text()
    } catch (fetchError) {
      logger.error("Failed to fetch iCal URL", fetchError)
      return NextResponse.json({ error: "Could not fetch the iCal URL" }, { status: 400 })
    }

    // Parse iCal events
    const events = parseICS(icsContent)
    
    if (events.length === 0) {
      return NextResponse.json({ error: "No events found in iCal feed" }, { status: 400 })
    }

    // Delete existing Wix-sourced blocked dates for this studio
    await supabase
      .from("studio_blocked_dates")
      .delete()
      .eq("studio_id", studioId)
      .like("reason", "Wix:%")

    // Convert iCal events to blocked dates
    const now = new Date()
    const wixBlockedDates: { studio_id: string; blocked_date: string; reason: string }[] = []

    for (const event of events) {
      // Only block dates in the future or very recent past (within 7 days)
      if (event.start >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        const dateStr = event.start.toISOString().split("T")[0]
        wixBlockedDates.push({
          studio_id: studioId,
          blocked_date: dateStr,
          reason: `Wix: ${event.summary}`
        })
      }
    }

    // Insert new blocked dates (batch insert)
    if (wixBlockedDates.length > 0) {
      const { error: insertError } = await supabase
        .from("studio_blocked_dates")
        .upsert(wixBlockedDates, { onConflict: "studio_id,blocked_date" })

      if (insertError) {
        logger.error("Failed to insert blocked dates", insertError)
      }
    }

    // Save the URL to the studio
    await supabase
      .from("studios")
      .update({ wix_calendar_url: ical_url })
      .eq("id", studioId)

    return NextResponse.json({
      success: true,
      message: `Connected! ${wixBlockedDates.length} datums geblokkeerd vanuit je Wix agenda.`,
      blockedDatesCount: wixBlockedDates.length
    })

  } catch (error) {
    logger.error("Error connecting Wix calendar", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { studioId } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: studio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", studioId)
      .single()

    if (!studio || studio.host_id !== user.id) {
      return NextResponse.json({ error: "Studio not found or unauthorized" }, { status: 404 })
    }

    // Delete Wix-sourced blocked dates when disconnecting
    await supabase
      .from("studio_blocked_dates")
      .delete()
      .eq("studio_id", studioId)
      .like("reason", "Wix:%")

    await supabase
      .from("studios")
      .update({ wix_calendar_url: null })
      .eq("id", studioId)

    return NextResponse.json({ success: true, message: "Wix calendar disconnected" })

  } catch (error) {
    logger.error("Error disconnecting Wix calendar", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}