"use client"

import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const categoryKeys = [
  { id: "film", icon: "movie", key: "catFilm" },
  { id: "photo", icon: "photo_camera", key: "catPhoto" },
  { id: "podcast", icon: "mic", key: "catPodcast" },
  { id: "music", icon: "music_note", key: "catMusic" },
  { id: "video", icon: "videocam", key: "catVideo" },
  { id: "daylight", icon: "wb_sunny", key: "catDaylight" },
  { id: "cyclorama", icon: "panorama_wide_angle", key: "catCyclorama" },
]

export function CategoryFilter() {
  const t = useTranslations("Studios")
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get("type")

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentType === categoryId) {
      params.delete("type")
    } else {
      params.set("type", categoryId)
    }
    router.push(`/studios?${params.toString()}`)
  }

  return (
    <div className="flex items-center sm:justify-center gap-2 sm:gap-4 overflow-x-auto pt-1 pb-1 sm:pt-2 sm:pb-2 hide-scrollbar">
      {categoryKeys.map((category) => {
        const isActive = currentType === category.id
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center gap-1 sm:gap-2 min-w-[70px] sm:min-w-[90px] px-3 sm:px-4 py-1.5 sm:py-3 rounded-[2rem] transition-all group ${
              isActive
                ? "bg-white shadow-sm border border-gray-100 ring-2 ring-black"
                : "hover:bg-white"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] sm:text-[24px] ${
                isActive ? "text-black" : "text-gray-400 group-hover:text-black"
              }`}
            >
              {category.icon}
            </span>
            <span
              className={`text-xs font-medium ${
                isActive ? "text-black font-semibold" : "text-gray-500 group-hover:text-black"
              }`}
            >
              {t(category.key)}
            </span>
          </button>
        )
      })}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
