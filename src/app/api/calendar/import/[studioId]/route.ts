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
      // A VEVENT needs at least a start; DTEND is optional (all-day / open-ended
      // events omit it) — fall back to the start date.
      if (currentEvent.start) {
        const start = parseICSDate(currentEvent.start)
        if (!isNaN(start.getTime())) {
          events.push({
            start,
            end: currentEvent.end ? parseICSDate(currentEvent.end) : start,
            summary: currentEvent.summary || "External Event"
          })
        }
      }
    } else if (inEvent) {
      // Property lines may carry params before the value, e.g.
      // "DTSTART;VALUE=DATE:20260722" or "DTSTART;TZID=Europe/Amsterdam:2026...".
      // Take everything after the LAST colon as the value.
      if (line.startsWith("DTSTART")) {
        currentEvent.start = line.slice(line.lastIndexOf(":") + 1).trim()
      } else if (line.startsWith("DTEND")) {
        currentEvent.end = line.slice(line.lastIndexOf(":") + 1).trim()
      } else if (line.startsWith("SUMMARY")) {
        currentEvent.summary = line.slice(line.indexOf(":") + 1).trim()
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
    const { ical_url, provider } = body

    if (!ical_url || typeof ical_url !== "string") {
      return NextResponse.json({ error: "iCal URL is required" }, { status: 400 })
    }

    const selectedProvider = provider === "meetingpackage" ? "meetingpackage" : "wix"

    // SSRF protection: restrict the fetched URL to HTTPS + trusted calendar hosts.
    const TRUSTED_ICAL_HOSTS = [
      // Wix
      "wix.com",
      "wixapps.net",
      "wixsite.com",
      "wixstatic.com",
      "parastorage.com",
      // MeetingPackage
      "meetingpackage.com",
      "meetingpackage.io",
    ]
    let parsedUrl: URL
    try {
      parsedUrl = new URL(ical_url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "URL must use HTTPS" },
        { status: 400 }
      )
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const isTrustedHost = TRUSTED_ICAL_HOSTS.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`)
    )
    if (!isTrustedHost) {
      return NextResponse.json(
        { error: `URL must point to a supported ${selectedProvider} calendar host` },
        { status: 400 }
      )
    }

    // Belt-and-braces: block private/loopback/link-local even if DNS resolves
    // a "trusted" hostname to an internal IP (DNS rebinding mitigation).
    if (
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      hostname === "::1" ||
      hostname.startsWith("fe80:")
    ) {
      return NextResponse.json(
        { error: "URL must point to a public host" },
        { status: 400 }
      )
    }

    // Fetch the iCal feed
    let icsContent: string
    try {
      const response = await fetch(ical_url, {
        headers: {
          "User-Agent": "LCTNSHIPS/1.0",
        },
        // Cap the fetch time so a slow attacker-controlled endpoint can't
        // tie up server resources.
        signal: AbortSignal.timeout(10_000),
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

    // Delete existing external calendar blocked dates for this studio
    await supabase
      .from("studio_blocked_dates")
      .delete()
      .eq("studio_id", studioId)
      .or("reason.like.Wix:%,reason.like.MeetingPackage:%")

    // Convert iCal events to blocked dates
    const now = new Date()
    const blockedDates: { studio_id: string; blocked_date: string; reason: string }[] = []

    for (const event of events) {
      // Only block dates in the future or very recent past (within 7 days)
      if (event.start >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        const dateStr = event.start.toISOString().split("T")[0]
        const providerLabel = selectedProvider === "wix" ? "Wix" : "MeetingPackage"
        blockedDates.push({
          studio_id: studioId,
          blocked_date: dateStr,
          reason: `${providerLabel}: ${event.summary}`
        })
      }
    }

    // Insert new blocked dates (batch insert)
    if (blockedDates.length > 0) {
      const { error: insertError } = await supabase
        .from("studio_blocked_dates")
        .upsert(blockedDates, { onConflict: "studio_id,blocked_date" })

      if (insertError) {
        logger.error("Failed to insert blocked dates", insertError)
      }
    }

    // Save the URL to the studio
    const updateData = selectedProvider === "wix" 
      ? { wix_calendar_url: ical_url }
      : { meetingpackage_calendar_url: ical_url }
    
    await supabase
      .from("studios")
      .update(updateData)
      .eq("id", studioId)

    return NextResponse.json({
      success: true,
      message: `Connected! ${blockedDates.length} datums geblokkeerd vanuit je ${selectedProvider} agenda.`,
      blockedDatesCount: blockedDates.length
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

    // Delete external calendar sourced blocked dates when disconnecting
    await supabase
      .from("studio_blocked_dates")
      .delete()
      .eq("studio_id", studioId)
      .or("reason.like.Wix:%,reason.like.MeetingPackage:%")

    await supabase
      .from("studios")
      .update({ 
        wix_calendar_url: null,
        meetingpackage_calendar_url: null 
      })
      .eq("id", studioId)

    return NextResponse.json({ success: true, message: "Calendar disconnected" })

  } catch (error) {
    logger.error("Error disconnecting Wix calendar", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}