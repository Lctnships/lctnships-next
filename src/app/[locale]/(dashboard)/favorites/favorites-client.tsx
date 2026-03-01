"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface Studio {
  id: string
  title: string
  location?: string
  city?: string
  price_per_hour: number
  images?: string[]
  studio_images?: { url: string }[]
  is_featured?: boolean
  studio_type?: string
}

interface FavoritesClientProps {
  studios: Studio[]
  totalCount: number
  isEmpty: boolean
}

type SortOption = "recent" | "price-low" | "price-high" | "name"
type FilterType = "all" | "photo" | "film" | "podcast" | "music"

export function FavoritesClient({ studios, totalCount, isEmpty }: FavoritesClientProps) {
  const t = useTranslations("Favorites")
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [favorites, setFavorites] = useState<string[]>(studios.map(s => s.id))
  const [displayCount, setDisplayCount] = useState(8)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const getStudioImage = (studio: Studio) => {
    return studio.images?.[0] || studio.studio_images?.[0]?.url || ""
  }

  const toggleFavorite = async (studioId: string) => {
    const isFavorited = favorites.includes(studioId)

    // Optimistic update
    setFavorites(prev =>
      prev.includes(studioId)
        ? prev.filter(id => id !== studioId)
        : [...prev, studioId]
    )

    try {
      if (isFavorited) {
        setIsRemoving(studioId)
        const response = await fetch(`/api/favorites?studioId=${studioId}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to remove")
        router.refresh()
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studio_id: studioId }),
        })
        if (!response.ok) throw new Error("Failed to add")
      }
    } catch (err) {
      // Revert on error
      setFavorites(prev =>
        isFavorited
          ? [...prev, studioId]
          : prev.filter(id => id !== studioId)
      )
      console.error("Failed to toggle favorite:", err)
    } finally {
      setIsRemoving(null)
    }
  }

  // Filter and sort studios
  let filteredStudios = studios.filter(studio => {
    const matchesSearch = studio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (studio.location || studio.city || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || studio.studio_type === filterType
    return matchesSearch && matchesType
  })

  // Sort studios
  filteredStudios = [...filteredStudios].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price_per_hour - b.price_per_hour
      case "price-high":
        return b.price_per_hour - a.price_per_hour
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const displayedStudios = filteredStudios.slice(0, displayCount)

  if (isEmpty && studios.length === 0) {
    return <FavoritesEmptyState t={t} />
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-gray-400 text-xl font-light">{t("subtitle", { count: totalCount })}</p>
        </div>
        <div>
          <Link
            href="/studios"
            className="bg-black text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-black/10 transition-all flex items-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            {t("bookStudio")}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-16 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button className="flex h-11 items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-6 hover:border-gray-900 transition-all">
            <span className="text-xs uppercase tracking-widest font-bold">{t("filterStudioType")}</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-6 hover:border-gray-900 transition-all">
            <span className="text-xs uppercase tracking-widest font-bold">{t("filterEquipment")}</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-6 hover:border-gray-900 transition-all">
            <span className="text-xs uppercase tracking-widest font-bold">{t("filterAvailability")}</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          <div className="w-px h-11 bg-gray-200 mx-2 hidden lg:block" />
          <button
            onClick={() => setSortBy(sortBy === "recent" ? "price-low" : "recent")}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 text-white px-6"
          >
            <span className="text-xs uppercase tracking-widest font-bold">
              {sortBy === "recent" ? t("sortRecent") : sortBy === "price-low" ? t("sortPriceLow") : t("sortPriceHigh")}
            </span>
            <span className="material-symbols-outlined text-lg">swap_vert</span>
          </button>
        </div>
        <div className="w-full lg:w-80">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">filter_list</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-4 h-11 text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>
      </div>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
        {displayedStudios.map((studio) => (
          <div key={studio.id} className="group bg-white rounded-xl p-2 pb-6 hover:shadow-lg transition-all duration-300">
            <Link href={`/studios/${studio.id}`}>
              <div className="relative overflow-hidden rounded-lg aspect-[4/5] mb-5">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${getStudioImage(studio)}")` }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(studio.id)
                  }}
                  className="absolute top-4 right-4 size-10 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-black transition-all hover:scale-110 active:scale-95 z-10"
                >
                  <span className={`material-symbols-outlined ${favorites.includes(studio.id) ? "heart-filled" : ""}`}>
                    favorite
                  </span>
                </button>
                {studio.is_featured && (
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.2em]">
                      {t("featured")}
                    </span>
                  </div>
                )}
              </div>
            </Link>
            <div className="px-2 flex justify-between items-start">
              <div>
                <Link href={`/studios/${studio.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight hover:text-black transition-colors">
                    {studio.title}
                  </h3>
                </Link>
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-1.5 font-medium">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {studio.location || studio.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-900">
                  €{studio.price_per_hour}
                  <span className="text-xs font-normal text-gray-400">{t("perHour")}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {displayedStudios.length < filteredStudios.length && (
        <div className="mt-24 flex flex-col items-center gap-6">
          <button
            onClick={() => setDisplayCount(prev => prev + 8)}
            className="px-12 py-5 bg-white rounded-full font-bold text-gray-900 border border-gray-200 hover:border-gray-900 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {t("loadMore")}
          </button>
          <p className="text-gray-400 text-sm font-medium">
            {t("showingCount", { shown: displayedStudios.length, total: filteredStudios.length })}
          </p>
        </div>
      )}

      {/* Empty search results */}
      {filteredStudios.length === 0 && searchQuery && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noResultsTitle")}</h3>
          <p className="text-gray-500">{t("noResultsDesc")}</p>
        </div>
      )}

      <style jsx global>{`
        .heart-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  )
}

function FavoritesEmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="max-w-md text-center">
        {/* Visual */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full" />
          <div className="absolute inset-8 bg-white rounded-full shadow-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-7xl text-gray-300">favorite</span>
          </div>
          <div className="absolute -top-4 -right-4 size-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-black">add</span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">{t("emptyTitle")}</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          {t("emptyDesc")}
        </p>

        {/* CTA */}
        <Link
          href="/studios"
          className="inline-flex items-center justify-center gap-2 bg-black text-white py-4 px-8 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <span>{t("emptyCta")}</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </div>
  )
}
