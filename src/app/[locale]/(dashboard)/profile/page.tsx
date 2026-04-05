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

  const profileData = {
    id: user.id,
    full_name: profile?.full_name || "",
    email: profile?.email || user.email,
    avatar_url: profile?.avatar_url,
    bio: profile?.bio || "",
    location: profile?.location || "",
    professional_title: profile?.professional_title || "",
    user_type: profile?.user_type || "renter",
    is_verified: profile?.is_verified || false,
    created_at: profile?.created_at || user.created_at,
    response_rate: profile?.response_rate || 0,
    response_time: profile?.response_time || "",
    equipment_preferences: profile?.equipment_preferences || [],
    is_accepting_projects: profile?.is_accepting_projects ?? false,
    portfolio: [] as { id: string; title: string; image: string }[],
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
