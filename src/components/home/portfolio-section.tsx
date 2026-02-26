import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

// Bento-style: varied aspect ratios for dynamic layout
const fallbackImages = [
  { src: "/DSC01072.jpg", alt: "Editorial Shoot", aspect: "aspect-[3/4]" },
  { src: "/473152595_1246501043249763_3246981115478679962_n.jpg", alt: "Blackkstarr Editorial", aspect: "aspect-[4/5]" },
  { src: "/DSC02737-bewerkt.jpg", alt: "Portrait Session", aspect: "aspect-[2/3]" },
  { src: "/473273964_1246500853249782_1939085566303266140_n.jpg", alt: "Crown Series", aspect: "aspect-[3/4]" },
  { src: "/DSC05289.jpg", alt: "Couple Shoot", aspect: "aspect-[4/5]" },
  { src: "/DSC02741.jpg", alt: "Portrait Photography", aspect: "aspect-[3/4]" },
  { src: "/IMG_4694.jpg", alt: "Headshot Session", aspect: "aspect-[2/3]" },
  { src: "/497357232_18056287139337039_1118796353651795177_n.jpg", alt: "Creative Portrait", aspect: "aspect-[4/5]" },
]

const defaultAspects = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]"]

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

      <div className="columns-2 md:columns-4 gap-3 md:gap-4">
        {images.map((img, index) => {
          const aspect = (img as any).aspect || defaultAspects[index % defaultAspects.length]
          return (
            <div
              key={index}
              className="break-inside-avoid mb-3 md:mb-4 group relative rounded-2xl md:rounded-3xl overflow-hidden"
            >
              <div className={`${aspect} w-full relative`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  quality={75}
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-bold text-sm md:text-base">{img.alt}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
