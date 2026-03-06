"use client"

import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

interface Studio {
  id: string
  title: string
  location: string
  price_per_hour: number
  images?: string[]
  studio_type?: string
  rating?: number
}

interface StudioCardProps {
  studio: Studio
}

export function StudioCard({ studio }: StudioCardProps) {
  const t = useTranslations("Studios")
  const router = useRouter()
  const { user } = useUser()
  const [isFavorite, setIsFavorite] = useState(false)

  // Check favorite status on mount
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("studio_id", studio.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsFavorite(true)
      })
  }, [user, studio.id])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!user) {
      router.push(`/login?redirect=/studios/${studio.id}`)
      return
    }

    const newState = !isFavorite
    setIsFavorite(newState) // Optimistic update

    try {
      if (newState) {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studio_id: studio.id }),
        })
        if (!res.ok) throw new Error()
      } else {
        const res = await fetch(`/api/favorites?studioId=${studio.id}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error()
      }
    } catch {
      setIsFavorite(!newState) // Revert on error
    }
  }

  return (
    <Link href={`/studios/${studio.id}`} className="group cursor-pointer block">
      <div className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden mb-2.5 sm:mb-4 shadow-sm">
        {studio.images?.[0] ? (
          <Image
            src={studio.images[0]}
            alt={studio.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl sm:text-6xl text-gray-400">image</span>
          </div>
        )}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>
        {studio.studio_type && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              {studio.studio_type}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm sm:text-lg leading-tight truncate">{studio.title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">{studio.location}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm sm:text-lg">€{studio.price_per_hour}</p>
          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t("perHourLabel")}</p>
        </div>
      </div>
    </Link>
  )
}
