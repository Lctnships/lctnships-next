import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProfileClient } from "./profile-client"

export async function generateMetadata() {
  const t = await getTranslations("Profile")
  return {
    title: t("metaTitle"),
  }
}

// Mock portfolio items
const mockPortfolio = [
  {
    id: "1",
    title: "Urban Geometry, 2023",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  },
  {
    id: "2",
    title: "Behind the Lens",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600",
  },
  {
    id: "3",
    title: "Natural Light Series",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
  },
  {
    id: "4",
    title: "Night Frames",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
  },
  {
    id: "5",
    title: "Character Study",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
  },
  {
    id: "6",
    title: "Abstract Spaces",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600",
  },
]

// Mock equipment preferences
const mockEquipment = [
  "RED Komodo 6K",
  "Arri Skypanel",
  "Aputure 600d",
  "Sigma Art Lenses",
]

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get review stats
  const { data: reviewsReceived } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", user.id)

  const avgRating = reviewsReceived?.length
    ? reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length
    : 0

  // Get booking count
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("renter_id", user.id)
    .eq("status", "completed")

  // Get user's studios if host
  const { data: studios } = await supabase
    .from("studios")
    .select("id, title, location, price_per_hour, avg_rating, images, studio_images(*)")
    .eq("host_id", user.id)
    .limit(4)

  // Build profile data with mock fallbacks
  const profileData = {
    id: user.id,
    full_name: profile?.full_name || "Creative Professional",
    email: profile?.email || user.email,
    avatar_url: profile?.avatar_url,
    bio: profile?.bio || "Narrative & Commercial specialist with a focus on minimalist lighting and architectural composition.",
    location: profile?.location || "Amsterdam, Netherlands",
    professional_title: profile?.professional_title || "Cinematographer & Photographer",
    user_type: profile?.user_type || "renter",
    is_verified: profile?.is_verified || true,
    created_at: profile?.created_at || "2021-01-01",
    response_rate: profile?.response_rate || 98,
    response_time: profile?.response_time || "within an hour",
    equipment_preferences: profile?.equipment_preferences || mockEquipment,
    is_accepting_projects: profile?.is_accepting_projects ?? true,
    portfolio: mockPortfolio,
  }

  return (
    <ProfileClient
      profile={profileData}
      stats={{
        bookingCount: bookingCount || 0,
        avgRating,
        reviewCount: reviewsReceived?.length || 0,
      }}
      studios={studios || []}
      isOwnProfile={true}
    />
  )
}
