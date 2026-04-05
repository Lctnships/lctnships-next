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

  // Get user's studios
  const { data: studios } = await supabase
    .from("studios")
    .select("id, title, location, images")
    .eq("host_id", user.id)
    .limit(1)
    .single()

  // Get bookings for calendar
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
    .gte("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true })

  const calendarBookings = (bookings || []).map((b) => ({
    id: b.id,
    title: (b.renter as { full_name?: string })?.full_name || "Guest",
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
