"use client"

import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { STUDIO_TYPES } from "@/lib/constants/studio-types"
import { CITIES } from "@/lib/constants/cities"
import { AMENITIES } from "@/lib/constants/amenities"
import { useState, useCallback } from "react"

export function StudioFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")

  const currentType = searchParams.get("type") || ""
  const currentCity = searchParams.get("city") || ""
  const currentAmenities = searchParams.get("amenities")?.split(",") || []

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/studios?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams("q", search || null)
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity]

    updateParams("amenities", newAmenities.length > 0 ? newAmenities.join(",") : null)
  }

  const clearFilters = () => {
    router.push("/studios")
  }

  const hasFilters = currentType || currentCity || currentAmenities.length > 0 || search

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam of locatie..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit">Zoeken</Button>
      </form>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={currentType} onValueChange={(value) => updateParams("type", value || null)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type studio" />
          </SelectTrigger>
          <SelectContent>
            {STUDIO_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentCity} onValueChange={(value) => updateParams("city", value || null)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stad" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {currentAmenities.length > 0 && (
                <span className="ml-2 rounded-full bg-black text-white px-2 py-0.5 text-xs">
                  {currentAmenities.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Filter studio&apos;s op faciliteiten</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-medium mb-4">Faciliteiten</h4>
                <div className="space-y-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.value}
                        checked={currentAmenities.includes(amenity.value)}
                        onCheckedChange={() => toggleAmenity(amenity.value)}
                      />
                      <Label htmlFor={amenity.value} className="cursor-pointer">
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Wis filters
          </Button>
        )}
      </div>
    </div>
  )
}
