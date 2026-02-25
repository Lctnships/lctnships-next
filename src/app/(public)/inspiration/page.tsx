import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const metadata = {
  title: "Inspiratie | lcntships",
}

export default async function InspirationPage() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("id, title, images, studio_type, location")
    .eq("status", "active")
    .not("images", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  const inspirationItems: { id: string; title: string; image: string; location: string }[] = []
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

  if (inspirationItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">photo_library</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nog geen inspiratie beschikbaar</h3>
          <p className="text-gray-500 mb-6">Zodra er studio&apos;s worden toegevoegd, verschijnen ze hier.</p>
          <Link
            href="/studios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
          >
            Bekijk studio&apos;s
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Inspiratie</h1>
        <p className="text-gray-500">Ontdek creatieve ruimtes van onze community</p>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 lg:px-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-5 max-w-[2000px] mx-auto pb-24">
          {inspirationItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-5 group relative rounded-[24px] overflow-hidden"
            >
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-bold truncate">{item.title}</p>
                {item.location && (
                  <p className="text-white/80 text-xs">{item.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
