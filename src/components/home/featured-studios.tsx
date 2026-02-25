import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export async function FeaturedStudios() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(4)

  if (!studios || studios.length === 0) {
    return (
      <section className="max-w-[1440px] mx-auto px-8 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Featured Studios</h2>
          <p className="text-gray-500 mt-2">Curated premium spaces for your next project</p>
        </div>
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">photo_camera</span>
          <p className="text-gray-500">Binnenkort beschikbaar</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Featured Studios</h2>
        <p className="text-gray-500 mt-2">Curated premium spaces for your next project</p>
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm font-bold mt-4 group underline-offset-4 hover:underline"
        >
          Explore all studios{" "}
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {studios.map((studio) => (
          <Link key={studio.id} href={`/studios/${studio.id}`} className="group cursor-pointer">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-4 bg-gray-100">
              {studio.images?.[0] ? (
                <Image
                  src={studio.images[0]}
                  alt={studio.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-gray-300">image</span>
                </div>
              )}
              <button className="absolute top-5 right-5 size-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <span className="material-symbols-outlined text-xl">favorite</span>
              </button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{studio.title}</h3>
                <p className="text-gray-500 text-sm">{studio.location}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-yellow-400 filled">star</span>
                <span className="text-sm font-bold">{(studio.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>
            <p className="mt-2 font-bold text-sm">From &euro;{studio.price_per_hour}/h</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
