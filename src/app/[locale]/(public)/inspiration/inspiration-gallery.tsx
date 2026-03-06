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
    }, 250)
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

      {/* Side-by-side Detail Modal */}
      {selectedItem && (
        <div
          className={`fixed inset-0 z-50 flex items-end md:items-center justify-center transition-all duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Semi-transparent backdrop — page still visible */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal Card — bottom sheet on mobile, side-by-side on desktop */}
          <div
            className={`relative bg-white overflow-hidden shadow-2xl w-full h-[95vh] md:h-auto flex flex-col rounded-t-3xl md:rounded-3xl md:max-w-[1100px] md:max-h-[90vh] md:mx-4 md:flex-row transition-all duration-250 ${
              isClosing
                ? "translate-y-full md:translate-y-0 md:scale-95 opacity-0"
                : "translate-y-0 md:scale-100 opacity-100"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* LEFT — Full Photo */}
            <div className="relative w-full md:w-[58%] flex-shrink-0 bg-gray-100">
              {/* Navigation Arrows */}
              {selectedIndex !== null && selectedIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-700">
                    chevron_right
                  </span>
                </button>
              )}

              {/* Counter Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                <span className="text-white text-xs font-bold">
                  {(selectedIndex ?? 0) + 1} / {items.length}
                </span>
              </div>

              {/* Image — object-contain so full photo is always visible */}
              <div className="relative w-full h-[55vh] md:h-full md:min-h-[70vh]">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  quality={90}
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            </div>

            {/* RIGHT — Info Panel */}
            <div className="md:w-[42%] overflow-y-auto flex flex-col">
              <div className="p-6 md:p-8 flex-1">
                {/* Title */}
                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                  {selectedItem.title}
                </h2>
                {selectedItem.location && (
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1.5">
                    <span className="material-symbols-outlined text-base">
                      location_on
                    </span>
                    <span className="text-sm">{selectedItem.location}</span>
                  </div>
                )}

                {/* Studio Link */}
                {selectedItem.studioId && (
                  <a
                    href={`/studios/${selectedItem.studioId}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mt-5 text-sm font-bold"
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
              </div>

              {/* Thumbnail Strip — pinned at bottom of right panel */}
              <div className="border-t border-gray-100 p-6 md:px-8">
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
                          className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden transition-all duration-200 ${
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
