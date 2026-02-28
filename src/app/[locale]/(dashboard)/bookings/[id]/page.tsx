import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { BookingDetailClient } from "./booking-detail-client"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BookingDetailPageProps) {
  const { id } = await params
  const t = await getTranslations("BookingDetail")
  return {
    title: t("metaTitle"),
  }
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (
        *,
        studio_images (*)
      ),
      host:users!bookings_host_id_fkey (*)
    `)
    .eq("id", id)
    .eq("renter_id", user.id)
    .single()

  // Mock booking data if not found (for demo purposes)
  const mockBooking = {
    id: id,
    booking_number: "ST-20948",
    start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    total_hours: 6,
    subtotal: 450,
    service_fee: 42,
    total_amount: 567,
    status: "confirmed",
    payment_status: "paid",
    notes: null,
    created_at: new Date().toISOString(),
    studio: {
      id: "studio-1",
      title: "Oceanic Sound Studio",
      city: "Los Angeles",
      country: "USA",
      address: "1280 North Highland Ave, Suite 402, Los Angeles, CA 90038",
      entry_code: "4892#",
      wifi_password: "oceanic_guest_2024",
      access_instructions: "The entry code will be active 15 minutes before your session begins. Please use the side entrance on 5th Ave.",
      studio_images: [
        { image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200", is_cover: true }
      ]
    },
    host: {
      id: "host-1",
      full_name: "Marcus Valentino",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Professional Engineer",
    },
    equipment: [
      { name: "Neumann U87 Microphone", included: true },
      { name: "Avalon VT-737sp Preamp", included: true },
    ]
  }

  const booking = data || mockBooking

  if (!booking) {
    notFound()
  }

  return <BookingDetailClient booking={booking} />
}
