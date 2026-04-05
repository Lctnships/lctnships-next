import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { InspirationGallery } from "./inspiration-gallery"

export const metadata = {
  title: "Inspiratie | lctnships",
}

// Pinterest-style: varied aspect ratios for masonry effect
const fallbackItems = [
  { id: "fallback-1", title: "Editorial Shoot", image: "/DSC01072.jpg", location: "Amsterdam", aspect: "aspect-[3/4]" },
  { id: "fallback-2", title: "Blackkstarr Editorial", image: "/473152595_1246501043249763_3246981115478679962_n.jpg", location: "Amsterdam", aspect: "aspect-[4/5]" },
  { id: "fallback-3", title: "Portrait Session", image: "/DSC02737-bewerkt.jpg", location: "Amsterdam", aspect: "aspect-[2/3]" },
  { id: "fallback-4", title: "Crown Series", image: "/473273964_1246500853249782_1939085566303266140_n.jpg", location: "Amsterdam", aspect: "aspect-[4/5]" },
  { id: "fallback-5", title: "Couple Shoot", image: "/DSC05289.jpg", location: "Amsterdam", aspect: "aspect-[3/4]" },
  { id: "fallback-6", title: "Portrait Photography", image: "/DSC02741.jpg", location: "Amsterdam", aspect: "aspect-[2/3]" },
  { id: "fallback-7", title: "Headshot Session", image: "/IMG_4694.jpg", location: "Amsterdam", aspect: "aspect-[4/5]" },
  { id: "fallback-8", title: "Creative Portrait", image: "/497357232_18056287139337039_1118796353651795177_n.jpg", location: "Amsterdam", aspect: "aspect-[3/4]" },
]

export default async function InspirationPage() {
  const t = await getTranslations("Inspiration")
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("id, title, images, type, location")
    .eq("status", "active")
    .not("images", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  const inspirationItems: { id: string; title: string; image: string; location: string; studioId?: string; aspect?: string }[] = []
  if (studios) {
    for (const studio of studios) {
      if (studio.images && Array.isArray(studio.images)) {
        for (const img of studio.images) {
          if (typeof img === "string") {
            inspirationItems.push({
              id: `${studio.id}-${inspirationItems.length}`,
              title: studio.title,
              image: img,
              location: studio.location || "",
              studioId: studio.id,
            })
          }
        }
      }
    }
  }

  // Include local images alongside database images
  const items = [...fallbackItems, ...inspirationItems]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Pinterest Masonry Grid with Detail View */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <InspirationGallery items={items} />
      </div>
    </div>
  )
}
