import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProfileClient } from "./profile-client"
import { PUBLIC_USER_COLUMNS } from "@/lib/user-columns"

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
    .select(PUBLIC_USER_COLUMNS)
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

  // Fetch studios, portfolio, reviews, and booking history in parallel
  const [
    { data: studios },
    { data: portfolio },
    { data: reviews },
    { data: bookingHistory },
  ] = await Promise.all([
    supabase
      .from("studios")
      .select("id, title, location, price_per_hour, avg_rating, images, studio_images(image_url)")
      .eq("host_id", user.id)
      .limit(4),
    supabase
      .from("portfolio_items")
      .select("id, title, image_url, project_type, description")
      .eq("user_id", user.id)
      .order("order_index"),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer:users!reviews_reviewer_id_fkey(full_name, avatar_url)")
      .eq("reviewee_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("bookings")
      .select("id, start_datetime, end_datetime, total_hours, total_amount, status, studio:studios(title, city, studio_images(image_url, is_cover))")
      .eq("renter_id", user.id)
      .in("status", ["completed", "confirmed", "cancelled"])
      .order("start_datetime", { ascending: false })
      .limit(10),
  ])

  const profileData = {
    id: user.id,
    full_name: profile?.full_name || "",
    email: profile?.email || user.email,
    avatar_url: profile?.avatar_url,
    bio: profile?.bio || "",
    location: profile?.location || "",
    user_type: profile?.user_type || "renter",
    is_verified: profile?.is_verified || false,
    created_at: profile?.created_at || user.created_at,
    portfolio: (portfolio || []).map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image_url,
      description: p.description || "",
      project_type: p.project_type || "",
    })),
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
      reviews={(reviews || []).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment || "",
        created_at: r.created_at,
        reviewer_name: (r.reviewer as { full_name?: string } | null)?.full_name || "",
        reviewer_avatar: (r.reviewer as { avatar_url?: string } | null)?.avatar_url || "",
      }))}
      bookingHistory={(bookingHistory || []).map((b) => ({
        id: b.id,
        studio_title: (b.studio as { title?: string } | null)?.title || "Studio",
        studio_city: (b.studio as { city?: string } | null)?.city || "",
        studio_image: ((b.studio as { studio_images?: { image_url: string; is_cover: boolean }[] } | null)?.studio_images?.find((i) => i.is_cover) || (b.studio as { studio_images?: { image_url: string }[] } | null)?.studio_images?.[0])?.image_url || "",
        date: b.start_datetime,
        total_hours: b.total_hours,
        total_amount: b.total_amount,
        status: b.status,
      }))}
    />
  )
}
