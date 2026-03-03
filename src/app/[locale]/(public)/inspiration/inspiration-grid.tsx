"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface InspirationItem {
  id: string
  title: string
  image: string
  location: string
  aspect?: string
}

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[2/3]"]

export function InspirationGrid({ items }: { items: InspirationItem[] }) {
  const [selectedImage, setSelectedImage] = useState<InspirationItem | null>(null)

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {items.map((item, index) => {
          const aspect = item.aspect || aspectRatios[index % aspectRatios.length]
          return (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className={`${aspect} w-full relative`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading="lazy"
                  quality={75}
                  className="object-cover object-top transition-all duration-300 group-hover:brightness-90"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-bold truncate">{item.title}</p>
                {item.location && (
                  <p className="text-white/70 text-xs mt-0.5">{item.location}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{selectedImage?.title || "Image"}</DialogTitle>
          {selectedImage && (
            <div
              className="relative w-full flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-[90vw] max-h-[85vh]">
                <Image
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  width={1200}
                  height={1600}
                  className="object-contain max-h-[85vh] w-auto rounded-2xl"
                  quality={90}
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                  <p className="text-white text-lg font-bold">{selectedImage.title}</p>
                  {selectedImage.location && (
                    <p className="text-white/70 text-sm mt-1">{selectedImage.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
