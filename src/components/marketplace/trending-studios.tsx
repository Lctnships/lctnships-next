import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"

export async function TrendingStudios() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .or("is_published.eq.true,status.eq.active")
    .order("created_at", { ascending: false })
    .limit(3)

  if (!studios || studios.length === 0) {
    return (
      <div>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 block mb-2">
              Curated selection
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Trending Studios</h2>
          </div>
        </div>
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">trending_up</span>
          <p className="text-gray-500">Nog geen trending studios beschikbaar</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 block mb-2">
            Curated selection
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Trending Studios</h2>
        </div>
        <Link
          href="/studios"
          className="text-sm font-semibold border-b-2 border-primary/10 hover:border-primary transition-colors pb-1"
        >
          View all trending
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {studios.map((studio) => (
          <Link
            key={studio.id}
            href={`/studios/${studio.id}`}
            className="group relative aspect-[16/10] overflow-hidden rounded-[2.5rem] cursor-pointer shadow-2xl shadow-gray-200/20"
          >
            {studio.images?.[0] ? (
              <Image
                src={studio.images[0]}
                alt={studio.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-white/50">image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-2xl font-bold text-white mb-1">{studio.title}</h3>
              <p className="text-white/80 text-sm font-medium">{studio.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
