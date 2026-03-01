"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, MapPin } from "lucide-react"
import { Tables } from "@/types/database.types"
import { formatPrice } from "@/lib/utils/format-currency"
import { cn } from "@/lib/utils"

type Studio = Tables<"studios"> & {
  studio_images?: Tables<"studio_images">[]
}

interface StudioCardProps {
  studio: Studio
  isFavorite?: boolean
  onToggleFavorite?: (studioId: string) => void
}

export function StudioCard({ studio, isFavorite, onToggleFavorite }: StudioCardProps) {
  const coverImage = studio.studio_images?.find(img => img.is_cover) || studio.studio_images?.[0]

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Link href={`/studios/${studio.id}`}>
          {coverImage ? (
            <Image
              src={coverImage.image_url}
              alt={studio.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Geen afbeelding</span>
            </div>
          )}
        </Link>

        {/* Favorite button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(studio.id)
            }}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </Button>
        )}

        {/* Badges */}
        <div className="absolute bottom-2 left-2 flex gap-2">
          {studio.instant_book && (
            <Badge variant="secondary" className="bg-white/90">
              Instant Book
            </Badge>
          )}
          {studio.is_verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Geverifieerd
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/studios/${studio.id}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{studio.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{studio.city}</span>
              </div>
            </div>
            {studio.avg_rating > 0 && (
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{studio.avg_rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">({studio.total_reviews})</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-lg font-semibold">{formatPrice(studio.price_per_hour)}</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
