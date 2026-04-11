import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FavoritesClient } from "./favorites-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Favorites")
  return { title: t("metaTitle") }
}

export default async function FavoritesPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const supabase = await createClient()

  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      studio_id,
      created_at,
      studio:studios (
        *,
        studio_images (image_url, is_cover)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const studios = favorites?.map((f) => ({
    ...f.studio,
    favorite_id: f.studio_id,
  })).filter(Boolean) || []

  return (
    <FavoritesClient
      studios={studios as unknown as React.ComponentProps<typeof FavoritesClient>["studios"]}
      totalCount={studios.length}
      isEmpty={studios.length === 0}
    />
  )
}
