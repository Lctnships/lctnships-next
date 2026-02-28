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

  // Mock data if no bookings exist
  const mockBookings = [
    {
      id: "mock1",
      booking_number: "BK20240612",
      start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      total_hours: 8,
      total_amount: 480,
      status: "confirmed",
      studio: {
        id: "studio1",
        title: "Industrial Skyloft | Studio B",
        city: "Brooklyn Arts District, NY",
        studio_images: [{ image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", is_cover: true }]
      }
    },
    {
      id: "mock2",
      booking_number: "BK20240614",
      start_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      total_hours: 8,
      total_amount: 560,
      status: "pending",
      studio: {
        id: "studio2",
        title: "The Sound Stage | Hall C",
        city: "Downtown Industrial Hub",
        studio_images: [{ image_url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800", is_cover: true }]
      }
    },
    {
      id: "mock3",
      booking_number: "BK20231024",
      start_datetime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      total_hours: 4,
      total_amount: 240,
      status: "completed",
      has_review: false,
      studio: {
        id: "studio3",
        title: "The Velvet Room",
        city: "East London Creative District",
        studio_images: [{ image_url: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800", is_cover: true }]
      }
    },
    {
      id: "mock4",
      booking_number: "BK20230912",
      start_datetime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      total_hours: 6,
      total_amount: 360,
      status: "completed",
      has_review: true,
      review_rating: 5,
      studio: {
        id: "studio4",
        title: "Neon Pulse Audio",
        city: "Downtown, LA",
        studio_images: [{ image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", is_cover: true }]
      }
    },
  ]

  const mockFavorites = [
    { studio: { id: "fav1", title: "Minimalist Patio", city: "North Hills, CA", studio_images: [{ image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400", is_cover: true }] } },
    { studio: { id: "fav2", title: "Neon Loft | Studio A", city: "East Side, NY", studio_images: [{ image_url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400", is_cover: true }] } },
    { studio: { id: "fav3", title: "The Warehouse", city: "Downtown, LA", studio_images: [{ image_url: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=400", is_cover: true }] } },
  ]

  return (
    <BookingsClient
      bookings={bookings && bookings.length > 0 ? bookings : mockBookings}
      favorites={(favorites && favorites.length > 0 ? favorites : mockFavorites) as any}
      totalHours={totalHours || 128.5}
    />
  )
}
