"use client"

import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Camera, Video, Mic, Music, Music2, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { value: "", label: "Alle", icon: null },
  { value: "photo", label: "Fotografie", icon: Camera },
  { value: "video", label: "Video", icon: Video },
  { value: "podcast", label: "Podcast", icon: Mic },
  { value: "music", label: "Muziek", icon: Music },
  { value: "dance", label: "Dans", icon: Music2 },
  { value: "creative", label: "Creatief", icon: Palette },
]

export function StudioCategoryPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get("type") || ""

  const handleCategoryClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("type", value)
    } else {
      params.delete("type")
    }
    router.push(`/studios?${params.toString()}`)
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = currentType === category.value

          return (
            <Button
              key={category.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full",
                isActive && "bg-black text-white"
              )}
              onClick={() => handleCategoryClick(category.value)}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {category.label}
            </Button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
