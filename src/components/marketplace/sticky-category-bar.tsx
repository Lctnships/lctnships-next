"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function StickyCategoryBar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel goes out of view (top), the bar is stuck
        setIsStuck(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: "-65px 0px 0px 0px" }
    )

    // Place a sentinel element BEFORE the sticky element in the DOM
    // so we can detect when the bar reaches its sticky position
    const sentinel = document.createElement("div")
    sentinel.style.height = "1px"
    sentinel.style.width = "100%"
    sentinel.style.pointerEvents = "none"
    el.parentNode?.insertBefore(sentinel, el)

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "sticky top-16 md:top-20 z-40 transition-all duration-200",
        isStuck
          ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-b border-gray-200"
          : "bg-transparent"
      )}
    >
      {children}
    </div>
  )
}
