import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FavoritesClient } from "./favorites-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Favorites")
  return { title: t("metaTitle") }
}

// Mock data for when database is empty
const mockFavorites = [
  {
    id: "mock-1",
    title: "The Daylight Loft",
    location: "Amsterdam, NL",
    price_per_hour: 150,
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
    is_featured: true,
  },
  {
    id: "mock-2",
    title: "Ironworks Studio",
    location: "Rotterdam, NL",
    price_per_hour: 200,
    images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"],
  },
  {
    id: "mock-3",
    title: "Pure White Space",
    location: "Den Haag, NL",
    price_per_hour: 120,
    images: ["https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800"],
  },
  {
    id: "mock-4",
    title: "Vintage Creative Hub",
    location: "Utrecht, NL",
    price_per_hour: 95,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
  },
  {
    id: "mock-5",
    title: "Warehouse 52",
    location: "Amsterdam, NL",
    price_per_hour: 180,
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"],
  },
  {
    id: "mock-6",
    title: "The Pro Cyc",
    location: "Eindhoven, NL",
    price_per_hour: 250,
    images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"],
  },
  {
    id: "mock-7",
    title: "Skyline View Suite",
    location: "Amsterdam, NL",
    price_per_hour: 300,
    images: ["https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800"],
  },
  {
    id: "mock-8",
    title: "The Modern Bureau",
    location: "Groningen, NL",
    price_per_hour: 110,
    images: ["https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"],
  },
]

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

  // Use mock data if no favorites
  const displayStudios = studios.length > 0 ? studios : mockFavorites

  return (
    <FavoritesClient
      studios={displayStudios as any}
      totalCount={studios.length > 0 ? studios.length : mockFavorites.length}
      isEmpty={studios.length === 0}
    />
  )
}
