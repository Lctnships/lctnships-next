import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { BookingsClient } from "./bookings-client"

export async function generateMetadata() {
  const t = await getTranslations("Bookings")
  return {
    title: t("metaTitle"),
  }
}

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch user's bookings with studio details
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (
        id,
        title,
        city,
        address,
        studio_images (image_url, is_cover)
      )
    `)
    .eq("renter_id", user.id)
    .order("start_datetime", { ascending: false })

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      studio:studios (
        id,
        title,
        city,
        studio_images (image_url, is_cover)
      )
    `)
    .eq("user_id", user.id)
    .limit(3)

  // Calculate total hours booked
  const totalHours = bookings?.reduce((sum, booking) => sum + (booking.total_hours || 0), 0) || 0

  return (
    <BookingsClient
      bookings={bookings || []}
      favorites={(favorites || []) as any}
      totalHours={totalHours}
    />
  )
}
