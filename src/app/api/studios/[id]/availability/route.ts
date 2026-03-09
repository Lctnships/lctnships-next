import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/studios/[id]/availability - Get studio availability for a date range
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get studio details
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("id, title, price_per_hour, minimum_hours, maximum_hours")
      .eq("id", id)
      .single()

    if (studioError || !studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

    // Get bookings in date range
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, start_datetime, end_datetime, status")
      .eq("studio_id", id)
      .neq("status", "cancelled")
      .gte("start_datetime", startDate)
      .lte("end_datetime", endDate)
      .order("start_datetime", { ascending: true })

    if (bookingsError) throw bookingsError

    // Generate available time slots
    const start = new Date(startDate)
    const end = new Date(endDate)
    const availability: Array<{
      date: string
      slots: Array<{ start: string; end: string; available: boolean }>
    }> = []

    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const slots: Array<{ start: string; end: string; available: boolean }> = []

      // Generate hourly slots from 8 AM to 10 PM
      for (let hour = 8; hour < 22; hour++) {
        const slotStart = new Date(currentDate)
        slotStart.setHours(hour, 0, 0, 0)
        const slotEnd = new Date(currentDate)
        slotEnd.setHours(hour + 1, 0, 0, 0)

        // Check if slot conflicts with any booking
        const isBooked = bookings?.some((booking) => {
          if (!booking.start_datetime || !booking.end_datetime) return false
          const bookingStart = new Date(booking.start_datetime)
          const bookingEnd = new Date(booking.end_datetime)
          return slotStart < bookingEnd && slotEnd > bookingStart
        })

        // Check if slot is in the past
        const isPast = slotStart < new Date()

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: !isBooked && !isPast,
        })
      }

      availability.push({
        date: dateStr,
        slots,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      studio: {
        id: studio.id,
        title: studio.title,
        hourlyRate: studio.price_per_hour,
        minimumHours: studio.minimum_hours,
        maximumHours: studio.maximum_hours,
      },
      availability,
      bookings: bookings?.map((b) => ({
        start: b.start_datetime,
        end: b.end_datetime,
      })),
    })
  } catch (error: unknown) {
    logger.error("Error fetching availability", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}

// POST /api/studios/[id]/availability - Check if specific time is available
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { start_datetime, end_datetime } = body

    if (!start_datetime || !end_datetime) {
      return NextResponse.json(
        { error: "start_datetime and end_datetime are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check for conflicts
    const { data: conflicts, error } = await supabase
      .from("bookings")
      .select("id")
      .eq("studio_id", id)
      .neq("status", "cancelled")
      .or(`and(start_datetime.lt.${end_datetime},end_datetime.gt.${start_datetime})`)
      .limit(1)

    if (error) throw error

    const isAvailable = !conflicts || conflicts.length === 0
    const startTime = new Date(start_datetime)
    const isPast = startTime < new Date()

    return NextResponse.json({
      available: isAvailable && !isPast,
      reason: isPast
        ? "Cannot book in the past"
        : !isAvailable
        ? "Time slot conflicts with existing booking"
        : null,
    })
  } catch (error: unknown) {
    logger.error("Error checking availability", error)
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    )
  }
}
