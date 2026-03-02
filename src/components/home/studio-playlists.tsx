import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

// Curated playlists — each is a label + filter on studio types/tags
const playlists = [
  {
    key: "playlistFilm",
    icon: "movie",
    types: ["film", "video", "cyclorama"],
  },
  {
    key: "playlistPodcast",
    icon: "mic",
    types: ["podcast", "audio", "booth"],
  },
  {
    key: "playlistPhoto",
    icon: "photo_camera",
    types: ["photo", "daylight", "minimalist"],
  },
  {
    key: "playlistMusic",
    icon: "music_note",
    types: ["music", "recording"],
  },
  {
    key: "playlistContent",
    icon: "videocam",
    types: ["content", "influencer", "creative"],
  },
]

export async function StudioPlaylists() {
  const t = await getTranslations("Studios")
  const supabase = await createClient()

  // Fetch all active studios once
  const { data: allStudios } = await supabase
    .from("studios")
    .select("*")
    .or("is_published.eq.true,status.eq.active")
    .order("rating", { ascending: false })
    .limit(50)

  if (!allStudios || allStudios.length === 0) return null

  // Build playlists by matching studio types/tags
  const playlistsWithStudios = playlists.map((playlist) => {
    const matching = allStudios.filter((studio) => {
      const studioType = (studio.type || "").toLowerCase()
      const studioTags = (studio.tags || []).map((t: string) => t.toLowerCase())
      return playlist.types.some(
        (type) => studioType.includes(type) || studioTags.some((tag: string) => tag.includes(type))
      )
    })
    return { ...playlist, studios: matching.slice(0, 8) }
  })

  // Filter out empty playlists, ensure min 3 max 5
  const nonEmpty = playlistsWithStudios.filter((p) => p.studios.length > 0)

  // If fewer than 3 have matches, fill with fallback studios
  let displayPlaylists = nonEmpty.slice(0, 5)
  if (displayPlaylists.length < 3) {
    const remaining = playlists
      .filter((p) => !displayPlaylists.some((dp) => dp.key === p.key))
      .slice(0, 3 - displayPlaylists.length)
      .map((p) => ({ ...p, studios: allStudios.slice(0, 4) }))
    displayPlaylists = [...displayPlaylists, ...remaining].slice(0, 5)
  }

  // Pick a cover image for each playlist (first studio image)
  const playlistCards = displayPlaylists.map((playlist) => ({
    ...playlist,
    coverImage: playlist.studios.find((s) => s.images?.[0])?.images?.[0] || null,
    count: playlist.studios.length,
  }))

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16 md:mt-24">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 block mb-2">
          {t("playlistLabel")}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("playlistTitle")}</h2>
        <p className="text-gray-500 mt-2 max-w-xl">{t("playlistSubtitle")}</p>
      </div>

      {/* Single horizontal row of playlist cards */}
      <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 md:-mx-0 md:px-0">
        {playlistCards.map((playlist) => (
          <Link
            key={playlist.key}
            href={`/studios?type=${playlist.types[0]}`}
            className="group flex-shrink-0 w-[280px] md:w-[320px]"
          >
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
              {playlist.coverImage ? (
                <Image
                  src={playlist.coverImage}
                  alt={t(playlist.key)}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="material-symbols-outlined text-5xl text-gray-300">
                    {playlist.icon}
                  </span>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-white/80 text-xl">
                    {playlist.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{t(playlist.key)}</h3>
                <p className="text-white/60 text-sm mt-1">
                  {playlist.count} {t("playlistStudios")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
