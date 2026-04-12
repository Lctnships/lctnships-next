import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarClient } from "./calendar-client"

export const metadata = {
  title: "Calendar Management",
}


export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get ALL user's studios (not just the first one)
  const { data: allStudios } = await supabase
    .from("studios")
    .select("id, title, location, images, wix_calendar_url, meetingpackage_calendar_url")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  // Use the first studio as the "active" one for the calendar sidebar.
  // Future: add a studio selector dropdown in the calendar UI.
  const studios = allStudios?.[0] ?? null

  // Get bookings for ALL studios (not just one)
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      start_datetime,
      end_datetime,
      status,
      studio:studios (title),
      renter:users!bookings_renter_id_fkey (full_name)
    `)
    .eq("host_id", user.id)
    .in("status", ["pending", "confirmed"])
    .gte("start_datetime", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("start_datetime", { ascending: true })

  const calendarBookings = (bookings || []).map((b) => ({
    id: b.id,
    title: `${(b.renter as { full_name?: string })?.full_name || "Guest"} — ${(b.studio as { title?: string })?.title || "Studio"}`,
    type: "booking",
    date: new Date(b.start_datetime),
    endDate: b.end_datetime ? new Date(b.end_datetime) : undefined,
    color: "primary" as const,
  }))

  const studioData = studios || { id: "", title: "", location: "" }

  return (
    <CalendarClient
      bookings={calendarBookings}
      studio={studioData}
      pendingPayout={{ amount: 0, nextPayoutDate: "-", progress: 0 }}
    />
  )
}
