import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FavoritesClient } from "./favorites-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Favorites")
  return { title: t("metaTitle") }
}

export default async function FavoritesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      studio_id,
      created_at,
      studio:studios (
        *,
        studio_images (*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const studios = favorites?.map((f) => ({
    ...f.studio,
    favorite_id: f.studio_id,
  })).filter(Boolean) || []

  return (
    <FavoritesClient
      studios={studios as any}
      totalCount={studios.length}
      isEmpty={studios.length === 0}
    />
  )
}
