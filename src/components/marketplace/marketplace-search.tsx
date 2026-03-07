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
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const studioTypes = studioTypeKeys.map((s) => ({ id: s.id, label: t(s.key) }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("city", location)
    if (date) params.set("date", date)
    if (studioType) params.set("type", studioType)
    router.push(`/studios?${params.toString()}`)
    setMobileExpanded(false)
  }

  const popularCities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen"]

  return (
    <div className="flex flex-col items-center w-full">
      {/* Mobile: Compact search pill (Airbnb-style) */}
      <button
        onClick={() => setMobileExpanded(true)}
        className="md:hidden w-full flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-lg shadow-gray-200/50 border border-gray-100 active:scale-[0.98] transition-transform"
      >
        <span className="material-symbols-outlined text-xl text-black">search</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{location || t("searchButton") || "Zoeken"}</p>
          <p className="text-xs text-gray-400">{[date, studioType ? studioTypes.find(st => st.id === studioType)?.label : ""].filter(Boolean).join(" · ") || t("dates") + " · " + t("studioTypeLabel")}</p>
        </div>
        <div className="size-9 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-lg text-gray-600">tune</span>
        </div>
      </button>

      {/* Mobile: Expanded overlay */}
      {mobileExpanded && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={() => setMobileExpanded(false)} className="size-9 rounded-full flex items-center justify-center hover:bg-gray-100">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <span className="text-sm font-bold">{t("searchButton") || "Zoeken"}</span>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Location */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t("locationLabel")}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("searchCity")}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setLocation(city)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      location === city ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t("dates")}</label>
              <div className="flex flex-wrap gap-2 mb-3">
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
                      onClick={() => setDate(qd.value)}
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
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              />
            </div>

            {/* Studio Type */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{t("studioTypeLabel")}</label>
              <div className="grid grid-cols-2 gap-2">
                {studioTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setStudioType(studioType === type.id ? "" : type.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                      studioType === type.id
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => { setLocation(""); setDate(""); setStudioType("") }}
              className="px-6 py-3 rounded-full text-sm font-bold underline"
            >
              {t("clearAll") || "Wis alles"}
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 bg-black text-white rounded-full py-3 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              {t("searchButton") || "Zoeken"}
            </button>
          </div>
        </div>
      )}

      {/* Desktop: Full search bar (unchanged) */}
      <div className="hidden md:block">
        <div className="relative flex flex-row items-center bg-white rounded-[3.5rem] px-3 py-2 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex flex-row items-center">
            {/* Location */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLocationDropdown(!showLocationDropdown)
                  setShowDateDropdown(false)
                  setShowTypeDropdown(false)
                }}
                className="flex items-center gap-2 px-6 py-4 hover:bg-gray-50 rounded-[2.5rem] transition-all group"
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

            <div className="h-8 w-px bg-gray-200" />

            {/* Date */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown)
                  setShowLocationDropdown(false)
                  setShowTypeDropdown(false)
                }}
                className="flex items-center gap-2 px-6 py-4 hover:bg-gray-50 rounded-[2.5rem] transition-all group"
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

            <div className="h-8 w-px bg-gray-200" />

            {/* Studio Type */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown)
                  setShowLocationDropdown(false)
                  setShowDateDropdown(false)
                }}
                className="flex items-center gap-2 px-6 py-4 hover:bg-gray-50 rounded-[2.5rem] transition-all group"
              >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-black">category</span>
                <span className="text-sm font-medium">{studioType ? studioTypes.find(t => t.id === studioType)?.label : t("studioTypeLabel")}</span>
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
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
              className="ml-2 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/10"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
