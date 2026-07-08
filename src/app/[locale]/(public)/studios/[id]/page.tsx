import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { StudioDetailClient } from "./studio-detail-client"

interface StudioDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: StudioDetailPageProps) {
  const { id } = await params
  const t = await getTranslations("StudioDetail")

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select("title, description, city")
    .eq("id", id)
    .single()

  if (!studio) {
    return { title: t("studioNotFound") }
  }

  return {
    title: studio.title,
    description: studio.description || `${studio.title} in ${studio.city}`,
  }
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (*),
      studio_amenities (*),
      host:users!studios_host_id_fkey (id, full_name, avatar_url, bio, location, user_type, is_verified, created_at, updated_at)
    `)
    .eq("id", id)
    .or("is_published.eq.true,status.eq.active")
    .single()

  if (!studio) {
    notFound()
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey (id, full_name, avatar_url, is_verified, created_at)
    `)
    .eq("studio_id", id)
    .eq("review_type", "renter_to_studio")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get similar studios
  const { data: similarStudios } = await supabase
    .from("studios")
    .select("id, title, location, price_per_hour, avg_rating, images")
    .neq("id", id)
    .or("is_published.eq.true,status.eq.active")
    .limit(4)

  return (
    <StudioDetailClient
      studio={studio}
      reviews={reviews || []}
      similarStudios={similarStudios || []}
    />
  )
}
