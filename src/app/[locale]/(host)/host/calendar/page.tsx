import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { CalendarClient } from "./calendar-client"

export async function generateMetadata() {
  const t = await getTranslations("HostCalendar")
  return { title: t("pageTitle") }
}

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch studios, bookings, and pending payouts in parallel
  const [
    { data: allStudios },
    { data: bookings },
    { data: pendingPayouts },
  ] = await Promise.all([
    supabase
      .from("studios")
      .select("id, title, location, images, wix_calendar_url, meetingpackage_calendar_url, ical_token")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
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
      .order("start_datetime", { ascending: true }),
    supabase
      .from("payouts")
      .select("amount")
      .eq("host_id", user.id)
      .eq("status", "pending"),
  ])

  // Use the first studio as the "active" one for the calendar sidebar.
  const studios = allStudios?.[0] ?? null

  const calendarBookings = (bookings || []).map((b) => ({
    id: b.id,
    title: `${(b.renter as { full_name?: string })?.full_name || "Guest"} — ${(b.studio as { title?: string })?.title || "Studio"}`,
    type: "booking",
    date: new Date(b.start_datetime),
    endDate: b.end_datetime ? new Date(b.end_datetime) : undefined,
    color: "primary" as const,
  }))

  const studioData = studios || { id: "", title: "", location: "" }
  const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0
  const t = await getTranslations("HostCalendar")

  return (
    <CalendarClient
      bookings={calendarBookings}
      studio={studioData}
      pendingPayout={{
        amount: pendingAmount,
        nextPayoutDate: pendingAmount > 0 ? t("nextPayoutApprox") : t("nextPayoutNone"),
        progress: 0,
      }}
    />
  )
}
