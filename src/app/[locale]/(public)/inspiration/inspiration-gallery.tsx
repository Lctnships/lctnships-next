"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface InspirationItem {
  id: string
  title: string
  image: string
  location: string
  studioId?: string
  aspect?: string
}

const aspectRatios = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[2/3]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[2/3]",
]

export function InspirationGallery({ items }: { items: InspirationItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null

  const close = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedIndex(null)
      setIsClosing(false)
    }, 200)
  }, [])

  const goNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }, [selectedIndex, items.length])

  const goPrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [selectedIndex, close, goNext, goPrev])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedIndex])

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {items.map((item, index) => {
          const aspect = item.aspect || aspectRatios[index % aspectRatios.length]
          return (
            <div
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className={`${aspect} w-full relative`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading="lazy"
                  quality={75}
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-bold truncate">
                  {item.title}
                </p>
                {item.location && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {item.location}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pinterest-style Detail Modal */}
      {selectedItem && (
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto transition-all duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Semi-transparent backdrop — page still visible */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal Card */}
          <div
            className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-[900px] my-6 mx-4 transition-all duration-200 ${
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Navigation Arrows on Image */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-4 top-[35%] z-10 size-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-gray-700">
                  chevron_left
                </span>
              </button>
            )}
            {selectedIndex !== null && selectedIndex < items.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-4 top-[35%] z-10 size-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-gray-700">
                  chevron_right
                </span>
              </button>
            )}

            {/* Large Image */}
            <div className="relative w-full aspect-[3/4] max-h-[70vh] bg-gray-100">
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                fill
                quality={90}
                priority
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 900px"
              />
              {/* Counter Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                <span className="text-white text-xs font-bold">
                  {(selectedIndex ?? 0) + 1} / {items.length}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 md:p-8">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">
                    {selectedItem.title}
                  </h2>
                  {selectedItem.location && (
                    <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      <span className="text-sm">{selectedItem.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-black/90 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      favorite
                    </span>
                    Opslaan
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedItem.title,
                          url: window.location.href,
                        })
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                      }
                    }}
                    className="size-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      share
                    </span>
                  </button>
                </div>
              </div>

              {/* Studio Link */}
              {selectedItem.studioId && (
                <a
                  href={`/studios/${selectedItem.studioId}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-5 text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-lg text-gray-500">
                    photo_camera
                  </span>
                  Bekijk Studio
                  <span className="material-symbols-outlined text-sm text-gray-400">
                    chevron_right
                  </span>
                </a>
              )}

              {/* Thumbnail Strip */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Meer foto&apos;s
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {items
                    .slice(
                      Math.max(0, (selectedIndex ?? 0) - 4),
                      Math.min(items.length, (selectedIndex ?? 0) + 9)
                    )
                    .map((thumbItem) => {
                      const realIndex = items.findIndex(
                        (it) => it.id === thumbItem.id
                      )
                      const isActive = realIndex === selectedIndex
                      return (
                        <button
                          key={thumbItem.id}
                          onClick={() => {
                            if (realIndex !== -1) setSelectedIndex(realIndex)
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                            isActive
                              ? "ring-2 ring-black scale-105"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbItem.image}
                            alt={thumbItem.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
