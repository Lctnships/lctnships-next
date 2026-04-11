import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect, notFound } from "next/navigation"
import { BookingDetailClient } from "./booking-detail-client"

export const metadata = {
  title: "Booking Request",
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Try to get real booking. Renter contact details fetched separately
  // via admin client — migration 018 blocks email/phone from authenticated.
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (id, title, location, images, studio_images(*))
    `)
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!booking) {
    notFound()
  }

  const admin = createAdminClient()
  const { data: renter } = await admin
    .from("users")
    .select("id, full_name, avatar_url, email, phone, created_at, is_verified")
    .eq("id", booking.renter_id)
    .single()

  const bookingWithRenter = { ...booking, renter }

  // Get renter stats
  let renterStats = {
    totalBookings: 0,
    avgRating: 0,
    cancelRate: 0,
    responseTime: "-",
  }

  if (renter) {
    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("renter_id", renter.id)
      .eq("status", "completed")

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", renter.id)

    const { count: cancelledCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("renter_id", renter.id)
      .eq("status", "cancelled")

    const avgRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    renterStats = {
      totalBookings: bookingsCount || 0,
      avgRating: avgRating || 0,
      cancelRate: bookingsCount && cancelledCount
        ? Math.round((cancelledCount / (bookingsCount + cancelledCount)) * 100)
        : 0,
      responseTime: "-",
    }
  }

  // Build studio images - field is image_url, not url
  const studioImages = booking.studio?.images ||
    booking.studio?.studio_images?.map((img: { image_url: string }) => img.image_url) ||
    []

  return (
    <BookingDetailClient
      booking={{
        ...bookingWithRenter,
        studio: {
          ...booking.studio,
          images: studioImages,
        },
      }}
      renterStats={renterStats}
    />
  )
}
