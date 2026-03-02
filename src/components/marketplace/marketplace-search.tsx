"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const studioTypeKeys = [
  { id: "photo", key: "typePhoto" },
  { id: "video", key: "typeVideo" },
  { id: "podcast", key: "typePodcast" },
  { id: "music", key: "typeMusic" },
  { id: "dance", key: "typeDance" },
  { id: "art", key: "typeArt" },
]

export function MarketplaceSearch() {
  const t = useTranslations("Studios")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [location, setLocation] = useState(searchParams.get("city") || "")
  const [date, setDate] = useState(searchParams.get("date") || "")
  const [studioType, setStudioType] = useState(searchParams.get("type") || "")
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const studioTypes = studioTypeKeys.map((s) => ({ id: s.id, label: t(s.key) }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("city", location)
    if (date) params.set("date", date)
    if (studioType) params.set("type", studioType)
    router.push(`/studios?${params.toString()}`)
  }

  const popularCities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen"]

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-2xl md:rounded-[3.5rem] px-3 py-2 shadow-xl shadow-gray-200/50 border border-gray-100 w-full md:w-auto">
        <div className="flex flex-col md:flex-row items-stretch md:items-center">
          {/* Location */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown)
                setShowDateDropdown(false)
                setShowTypeDropdown(false)
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-[2.5rem] transition-all group w-full"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-black">location_on</span>
              <span className="text-sm font-medium">{location || t("locationLabel")}</span>
            </button>
            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("searchCity")}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("popular")}</p>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setLocation(city)
                        setShowLocationDropdown(false)
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block h-8 w-px bg-gray-200" />
          <div className="md:hidden h-px w-full bg-gray-100" />

          {/* Date */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown)
                setShowLocationDropdown(false)
                setShowTypeDropdown(false)
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-[2.5rem] transition-all group w-full"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-black">calendar_today</span>
              <span className="text-sm font-medium">{date || t("dates")}</span>
            </button>
            {showDateDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t("dates")}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(() => {
                    const today = new Date()
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    const saturday = new Date(today)
                    saturday.setDate(saturday.getDate() + (6 - saturday.getDay()))
                    const nextWeek = new Date(today)
                    nextWeek.setDate(nextWeek.getDate() + 7)
                    const fmt = (d: Date) => d.toISOString().split("T")[0]
                    const quickDates = [
                      { label: "Vandaag", value: fmt(today) },
                      { label: "Morgen", value: fmt(tomorrow) },
                      { label: "Dit weekend", value: fmt(saturday) },
                      { label: "Volgende week", value: fmt(nextWeek) },
                    ]
                    return quickDates.map((qd) => (
                      <button
                        key={qd.label}
                        onClick={() => {
                          setDate(qd.value)
                          setShowDateDropdown(false)
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          date === qd.value
                            ? "bg-black text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {qd.label}
                      </button>
                    ))
                  })()}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setDate(e.target.value)
                      setShowDateDropdown(false)
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block h-8 w-px bg-gray-200" />
          <div className="md:hidden h-px w-full bg-gray-100" />

          {/* Studio Type */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown)
                setShowLocationDropdown(false)
                setShowDateDropdown(false)
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 rounded-xl md:rounded-[2.5rem] transition-all group w-full"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-black">category</span>
              <span className="text-sm font-medium">{studioType ? studioTypes.find(t => t.id === studioType)?.label : t("studioTypeLabel")}</span>
            </button>
            {showTypeDropdown && (
              <div className="absolute top-full left-0 md:right-0 md:left-auto mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                {studioTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setStudioType(type.id)
                      setShowTypeDropdown(false)
                    }}
                    className={`w-full px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors ${
                      studioType === type.id ? "bg-gray-100 text-black" : "hover:bg-gray-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="mt-2 md:mt-0 md:ml-2 w-full md:w-14 h-12 md:h-14 bg-black text-white rounded-xl md:rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/10"
          >
            <span className="material-symbols-outlined">search</span>
            <span className="md:hidden text-sm font-medium">{t("searchButton") || "Search"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
