"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Star, Calendar, Settings, Eye, EyeOff, LayoutGrid, List } from "lucide-react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils/format-currency"
import { cn } from "@/lib/utils"

interface Studio {
  id: string
  title: string
  city: string
  price_per_hour: number
  avg_rating: number
  total_bookings: number
  is_published: boolean
  studio_images?: { image_url: string; is_cover: boolean }[]
}

export function StudiosListClient({ studios }: { studios: Studio[] }) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <>
      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setView("grid")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            view === "grid" ? "bg-white shadow-sm text-black" : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setView("list")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            view === "list" ? "bg-white shadow-sm text-black" : "text-muted-foreground"
          )}
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {studios.map((studio) => (
            <GridCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {studios.map((studio) => (
            <ListRow key={studio.id} studio={studio} />
          ))}
        </div>
      )}
    </>
  )
}

function GridCard({ studio }: { studio: Studio }) {
  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]

  return (
    <Card className="overflow-hidden shadow-none border">
      <div className="relative aspect-video bg-muted">
        {coverImage ? (
          <Image
            src={coverImage.image_url}
            alt={studio.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <Badge
          className="absolute top-2 right-2 text-[10px] md:text-xs"
          variant={studio.is_published ? "default" : "secondary"}
        >
          {studio.is_published ? (
            <><Eye className="h-3 w-3 mr-1" /> Gepubliceerd</>
          ) : (
            <><EyeOff className="h-3 w-3 mr-1" /> Concept</>
          )}
        </Badge>
      </div>

      <CardContent className="p-3.5 md:p-4">
        <h3 className="font-semibold text-sm md:text-base truncate">{studio.title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground">{studio.city}</p>

        <div className="flex items-center gap-3 mt-2 text-xs md:text-sm">
          <span className="font-semibold">{formatCurrency(studio.price_per_hour)}/uur</span>
          {studio.avg_rating > 0 && (
            <span className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-0.5" />
              {studio.avg_rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-0.5" />
            {studio.total_bookings}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <Link href={`/host/studios/${studio.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full h-8 text-xs md:text-sm" size="sm">
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Bewerken
            </Button>
          </Link>
          <Link href="/host/calendar">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Calendar className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/studios/${studio.id}`}>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function ListRow({ studio }: { studio: Studio }) {
  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]

  return (
    <Link href={`/host/studios/${studio.id}/edit`} className="block">
      <Card className="shadow-none border transition-colors hover:border-black/20">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {coverImage ? (
                <Image
                  src={coverImage.image_url}
                  alt={studio.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{studio.title}</h3>
                  <p className="text-xs text-muted-foreground">{studio.city}</p>
                </div>
                <Badge
                  variant={studio.is_published ? "default" : "secondary"}
                  className="text-[10px] flex-shrink-0"
                >
                  {studio.is_published ? "Live" : "Concept"}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {formatCurrency(studio.price_per_hour)}/uur
                </span>
                {studio.avg_rating > 0 && (
                  <span className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                    {studio.avg_rating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-0.5" />
                  {studio.total_bookings} boekingen
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
