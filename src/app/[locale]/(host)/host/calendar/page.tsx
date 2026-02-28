import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarClient } from "./calendar-client"

export const metadata = {
  title: "Calendar Management",
}

// Mock bookings for calendar demo
const mockCalendarBookings = [
  {
    id: "1",
    title: "Vogue × H&M",
    type: "editorial",
    date: new Date(2024, 9, 1), // Oct 1
    color: "primary" as const,
  },
  {
    id: "2",
    title: "Lunar Echoes",
    type: "music_video",
    date: new Date(2024, 9, 3), // Oct 3
    color: "blue" as const,
  },
  {
    id: "3",
    title: "Nike Runners",
    type: "commercial",
    date: new Date(2024, 9, 5), // Oct 5
    color: "orange" as const,
  },
  {
    id: "4",
    title: "Zara Winter '24",
    type: "photoshoot",
    date: new Date(2024, 9, 10), // Oct 10-12
    color: "primary" as const,
    endDate: new Date(2024, 9, 12),
  },
  {
    id: "5",
    title: "Harper's Bazaar",
    type: "editorial",
    date: new Date(2024, 9, 24), // Oct 24
    color: "primary" as const,
  },
]

const mockStudio = {
  id: "studio-1",
  title: "Creative Loft Studio",
  location: "DTLA District",
  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
}

const mockPendingPayout = {
  amount: 4280.00,
  nextPayoutDate: "Oct 12",
  progress: 66,
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

  // Use real data if available, otherwise use mock
  const calendarBookings = bookings && bookings.length > 0
    ? bookings.map((b) => ({
        id: b.id,
        title: (b.renter as any)?.full_name || "Guest",
        type: "booking",
        date: new Date(b.start_datetime),
        endDate: b.end_datetime ? new Date(b.end_datetime) : undefined,
        color: "primary" as const,
      }))
    : mockCalendarBookings

  const studioData = studios || mockStudio

  return (
    <CalendarClient
      bookings={calendarBookings}
      studio={studioData}
      pendingPayout={mockPendingPayout}
    />
  )
}
