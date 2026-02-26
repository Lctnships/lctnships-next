import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

const fallbackImages = [
  { src: "/DSC01072.jpg", alt: "Editorial Shoot" },
  { src: "/473152595_1246501043249763_3246981115478679962_n.jpg", alt: "Blackkstarr Editorial" },
  { src: "/DSC02737-bewerkt.jpg", alt: "Portrait Session" },
  { src: "/473273964_1246500853249782_1939085566303266140_n.jpg", alt: "Crown Series" },
  { src: "/DSC05289.jpg", alt: "Couple Shoot" },
  { src: "/DSC02741.jpg", alt: "Portrait Photography" },
  { src: "/IMG_4694.jpg", alt: "Headshot Session" },
  { src: "/497357232_18056287139337039_1118796353651795177_n.jpg", alt: "Creative Portrait" },
]

export async function PortfolioSection() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("images, title")
    .eq("status", "active")
    .not("images", "is", null)
    .limit(8)

  const portfolioImages: { src: string; alt: string }[] = []
  if (studios) {
    for (const studio of studios) {
      if (studio.images && Array.isArray(studio.images)) {
        for (const img of studio.images) {
          if (portfolioImages.length < 8 && typeof img === "string") {
            portfolioImages.push({ src: img, alt: studio.title || "Studio" })
          }
        }
      }
    }
  }

  // Include local images alongside database images
  const images = [...fallbackImages, ...portfolioImages].slice(0, 8)

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16 md:mt-32">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Made with lcntships</h2>
        <p className="text-gray-500 mt-2">Work created by our community in our partner studios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative w-full rounded-[32px] overflow-hidden ${
              index % 2 === 0 ? "h-72 sm:h-96" : "h-80 sm:h-[28rem]"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white font-bold text-lg">{img.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
