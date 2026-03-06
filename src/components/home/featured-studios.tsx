import { Link } from "@/i18n/routing"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { FavoriteButton } from "@/components/ui/favorite-button"

export async function FeaturedStudios() {
  const t = await getTranslations("Home")
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(4)

  if (!studios || studios.length === 0) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-12 md:mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t("featuredTitle")}</h2>
          <p className="text-gray-500 mt-2">{t("featuredSubtitle")}</p>
        </div>
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">photo_camera</span>
          <p className="text-gray-500">{t("comingSoon")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-8 sm:mt-12 md:mt-20">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">{t("featuredTitle")}</h2>
        <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{t("featuredSubtitle")}</p>
        <Link
          href="/studios"
          className="inline-flex items-center gap-2 text-sm font-bold mt-3 sm:mt-4 group underline-offset-4 hover:underline"
        >
          {t("viewAllStudios")}{" "}
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
        {studios.map((studio) => (
          <Link key={studio.id} href={`/studios/${studio.id}`} className="group cursor-pointer">
            <div className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden mb-2 sm:mb-4 bg-gray-100">
              {studio.images?.[0] ? (
                <Image
                  src={studio.images[0]}
                  alt={studio.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl sm:text-5xl text-gray-300">image</span>
                </div>
              )}
              <FavoriteButton />
            </div>
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-lg truncate">{studio.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm truncate">{studio.location}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-yellow-400 filled">star</span>
                <span className="text-xs sm:text-sm font-bold">{(studio.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>
            <p className="mt-1 sm:mt-2 font-bold text-xs sm:text-sm">{t("fromPrice")} &euro;{studio.price_per_hour}{t("perHour")}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
