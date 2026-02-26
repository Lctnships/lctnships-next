import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

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

  if (portfolioImages.length === 0) {
    return null
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16 md:mt-32">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Made with lcntships</h2>
        <p className="text-gray-500 mt-2">Work created by our community in our partner studios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {portfolioImages.length >= 2 && (
          <div className="grid gap-4">
            <div className="relative w-full h-64 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[0].src}
                alt={portfolioImages[0].alt}
                fill
                className="object-cover"
              />
            </div>
            {portfolioImages[1] && (
              <div className="relative w-full h-96 rounded-[32px] overflow-hidden">
                <Image
                  src={portfolioImages[1].src}
                  alt={portfolioImages[1].alt}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {portfolioImages.length >= 4 && (
          <div className="grid gap-4">
            <div className="relative w-full h-80 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[2].src}
                alt={portfolioImages[2].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-full h-80 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[3].src}
                alt={portfolioImages[3].alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {portfolioImages.length >= 6 && (
          <div className="grid gap-4">
            <div className="relative w-full h-96 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[4].src}
                alt={portfolioImages[4].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-full h-64 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[5].src}
                alt={portfolioImages[5].alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {portfolioImages.length >= 8 && (
          <div className="grid gap-4">
            <div className="relative w-full h-64 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[6].src}
                alt={portfolioImages[6].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-full h-96 rounded-[32px] overflow-hidden">
              <Image
                src={portfolioImages[7].src}
                alt={portfolioImages[7].alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
