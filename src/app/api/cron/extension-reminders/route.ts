import { createServiceClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServiceClient()

  try {
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000)

    const { data: studiosWithExtensions } = await supabase
      .from("studios")
      .select("id, allow_extensions")
      .eq("allow_extensions", true)

    if (!studiosWithExtensions || studiosWithExtensions.length === 0) {
      return NextResponse.json({ processed: 0, message: "No studios allow extensions" })
    }

    const studioIds = studiosWithExtensions.map(s => s.id)

    const { data: upcomingBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        end_datetime,
        renter_id,
        studio_id,
        status,
        studio:studios!bookings_studio_id_fkey (title, allow_extensions)
      `)
      .eq("status", "confirmed")
      .eq("payment_status", "paid")
      .in("studio_id", studioIds)
      .gte("end_datetime", now.toISOString())
      .lte("end_datetime", thirtyMinutesFromNow.toISOString())

    if (!upcomingBookings || upcomingBookings.length === 0) {
      return NextResponse.json({ processed: 0, message: "No bookings ending soon" })
    }

    let notificationsSent = 0

    for (const booking of upcomingBookings) {
      const endTime = new Date(booking.end_datetime)
      const minutesUntilEnd = Math.floor((endTime.getTime() - now.getTime()) / 60000)

      const existingNotification = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", booking.renter_id)
        .eq("type", "extension_reminder_30")
        .eq("link", `/bookings/${booking.id}`)
        .gte("created_at", new Date(now.getTime() - 35 * 60 * 1000).toISOString())
        .single()

      if (minutesUntilEnd <= 30 && minutesUntilEnd > 10 && !existingNotification) {
        await supabase.from("notifications").insert({
          user_id: booking.renter_id,
          type: "extension_reminder_30",
          title: "Sessie eindigt binnenkort",
          message: `Je sessie bij ${(booking.studio as { title?: string })?.title || 'de studio'} eindigt over 30 minuten. Wil je verlengen?`,
          link: `/bookings/${booking.id}/extend`,
        })
        notificationsSent++
        logger.info("Sent 30-min extension reminder", { bookingId: booking.id })
      }

      if (minutesUntilEnd <= 10 && minutesUntilEnd > 5) {
        const reminder10 = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", booking.renter_id)
          .eq("type", "extension_reminder_10")
          .eq("link", `/bookings/${booking.id}`)
          .gte("created_at", new Date(now.getTime() - 15 * 60 * 1000).toISOString())
          .single()

        if (!reminder10) {
          await supabase.from("notifications").insert({
            user_id: booking.renter_id,
            type: "extension_reminder_10",
            title: "Laatste kans om te verlengen",
            message: `Nog 10 minuten! Verleng je sessie bij ${(booking.studio as { title?: string })?.title || 'de studio'} nu.`,
            link: `/bookings/${booking.id}/extend`,
          })
          notificationsSent++
          logger.info("Sent 10-min extension reminder", { bookingId: booking.id })
        }
      }
    }

    return NextResponse.json({ 
      processed: upcomingBookings.length, 
      notifications: notificationsSent 
    })

  } catch (error) {
    logger.error("Cron job error", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}