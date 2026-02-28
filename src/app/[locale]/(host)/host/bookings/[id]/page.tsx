import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { BookingDetailClient } from "./booking-detail-client"

export const metadata = {
  title: "Booking Request",
}

// Mock booking data for demo
const mockBooking = {
  id: "booking-123",
  booking_number: "BK-2024-0892",
  status: "pending" as const,
  payment_status: "paid" as const,
  created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
  end_datetime: new Date(Date.now() + 86400000 * 5 + 32400000).toISOString(),
  total_hours: 9,
  hourly_rate: 120,
  subtotal: 1080,
  service_fee: 108,
  total_price: 1188,
  host_payout: 1026,
  notes: "Hi! I'm planning a fashion editorial shoot with a team of 5 people. We'll need the natural light setup and the white cyc wall. Looking forward to using your amazing space!",
  renter: {
    id: "renter-1",
    full_name: "Sarah Mitchell",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    email: "sarah@example.com",
    phone: "+31 6 12345678",
    created_at: "2022-06-15",
    is_verified: true,
  },
  studio: {
    id: "studio-1",
    title: "Industrial Loft NYC",
    location: "Brooklyn, New York",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
  },
}

const mockRenterStats = {
  totalBookings: 12,
  avgRating: 4.8,
  cancelRate: 0,
  responseTime: "< 1hr",
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

  // Try to get real booking
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (id, title, location, images, studio_images(*)),
      renter:users!bookings_renter_id_fkey (id, full_name, avatar_url, email, phone, created_at, is_verified)
    `)
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  // Get renter stats if we have a real booking
  let renterStats = mockRenterStats
  if (booking?.renter) {
    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("renter_id", booking.renter.id)
      .eq("status", "completed")

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", booking.renter.id)

    const { count: cancelledCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("renter_id", booking.renter.id)
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
      responseTime: "< 1hr",
    }
  }

  // Use mock data if no real booking found
  const bookingData = booking || mockBooking

  // Build studio images
  const studioImages = booking?.studio?.images ||
    booking?.studio?.studio_images?.map((img: { url: string }) => img.url) ||
    mockBooking.studio.images

  return (
    <BookingDetailClient
      booking={{
        ...bookingData,
        studio: {
          ...bookingData.studio,
          images: studioImages,
        },
      }}
      renterStats={renterStats}
    />
  )
}
