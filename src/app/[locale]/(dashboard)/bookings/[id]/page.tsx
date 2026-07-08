import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { BookingDetailClient } from "./booking-detail-client"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BookingDetailPageProps) {
  const _params = await params
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
      host:users!bookings_host_id_fkey (id, full_name, avatar_url, bio, location, user_type, is_verified, created_at, updated_at)
    `)
    .eq("id", id)
    .eq("renter_id", user.id)
    .single()

  if (!data) {
    notFound()
  }

  return <BookingDetailClient booking={data} />
}
