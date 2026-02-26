import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const metadata = {
  title: "Inspiratie | lcntships",
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

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[2/3]"]

export default async function InspirationPage() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("id, title, images, studio_type, location")
    .eq("status", "active")
    .not("images", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  const inspirationItems: { id: string; title: string; image: string; location: string; aspect?: string }[] = []
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
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Inspiratie</h1>
        <p className="text-gray-500">Ontdek creatieve ruimtes van onze community</p>
      </div>

      {/* Pinterest Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {items.map((item, index) => {
            const aspect = item.aspect || aspectRatios[index % aspectRatios.length]
            return (
              <div
                key={item.id}
                className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className={`${aspect} w-full relative`}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm font-bold truncate">{item.title}</p>
                  {item.location && (
                    <p className="text-white/70 text-xs mt-0.5">{item.location}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
