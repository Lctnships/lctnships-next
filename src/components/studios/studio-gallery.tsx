"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react"
import { Tables } from "@/types/database.types"
import { cn } from "@/lib/utils"

interface StudioGalleryProps {
  images: Tables<"studio_images">[]
  title: string
}

export function StudioGallery({ images, title }: StudioGalleryProps) {
  const [showAll, setShowAll] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover) return -1
    if (b.is_cover) return 1
    return a.order_index - b.order_index
  })

  const mainImage = sortedImages[0]
  const gridImages = sortedImages.slice(1, 5)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">Geen afbeeldingen</span>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Main grid layout */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden aspect-[2/1]">
          {/* Main image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer"
            onClick={() => setShowAll(true)}
          >
            {mainImage && (
              <Image
                src={mainImage.image_url}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:opacity-90 transition-opacity"
                priority
              />
            )}
          </div>

          {/* Grid images */}
          {gridImages.map((image, index) => (
            <div
              key={image.id}
              className="relative cursor-pointer"
              onClick={() => {
                setCurrentIndex(index + 1)
                setShowAll(true)
              }}
            >
              <Image
                src={image.image_url}
                alt={`${title} ${index + 2}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover hover:opacity-90 transition-opacity"
              />
            </div>
          ))}

          {/* Empty slots if less than 5 images */}
          {gridImages.length < 4 &&
            [...Array(4 - gridImages.length)].map((_, i) => (
              <div key={`empty-${i}`} className="bg-muted" />
            ))}
        </div>

        {/* Show all button */}
        {sortedImages.length > 5 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
            onClick={() => setShowAll(true)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Alle foto&apos;s ({sortedImages.length})
          </Button>
        )}
      </div>

      {/* Fullscreen gallery dialog */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-5xl p-0 bg-black/95">
          <div className="relative aspect-video">
            <Image
              src={sortedImages[currentIndex]?.image_url || ""}
              alt={`${title} ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 p-4 overflow-x-auto">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative w-20 h-20 rounded overflow-hidden flex-shrink-0",
                  index === currentIndex && "ring-2 ring-white"
                )}
              >
                <Image
                  src={image.image_url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
