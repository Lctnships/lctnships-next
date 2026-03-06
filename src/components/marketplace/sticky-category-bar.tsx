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

    // Create a sentinel element right before the sticky element
    const sentinel = document.createElement("div")
    sentinel.style.height = "1px"
    sentinel.style.width = "100%"
    sentinel.style.position = "absolute"
    sentinel.style.top = "-1px"
    sentinel.style.pointerEvents = "none"
    el.style.position = "relative"
    el.prepend(sentinel)

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
        "sticky top-16 md:top-20 z-40 bg-[#fcfcfc] transition-shadow duration-200",
        isStuck && "shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-b border-gray-100"
      )}
    >
      {children}
    </div>
  )
}
