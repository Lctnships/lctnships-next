"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

const activityKeys = [
  { icon: "photo_camera", key: "activityPhoto" },
  { icon: "videocam", key: "activityFilm" },
  { icon: "mic", key: "activityPodcast" },
  { icon: "music_note", key: "activityMusic" },
  { icon: "settings_accessibility", key: "activityDance" },
  { icon: "palette", key: "activityArt" },
] as const

const popularCities = [
  { nameKey: "cityAmsterdam", countryKey: "countryNetherlands" },
  { nameKey: "cityRotterdam", countryKey: "countryNetherlands" },
  { nameKey: "cityTheHague", countryKey: "countryNetherlands" },
  { nameKey: "cityUtrecht", countryKey: "countryNetherlands" },
  { nameKey: "cityLondon", countryKey: "countryUK" },
  { nameKey: "cityBerlin", countryKey: "countryGermany" },
  { nameKey: "cityParis", countryKey: "countryFrance" },
  { nameKey: "cityAntwerp", countryKey: "countryBelgium" },
] as const

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: (Date | null)[] = []

  // Monday-based week: getDay() returns 0=Sun, we want 0=Mon
  const startDay = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  return days
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getLocaleCode(locale: string) {
  const map: Record<string, string> = { nl: "nl-NL", en: "en-GB", es: "es-ES" }
  return map[locale] || "nl-NL"
}

function getWeekdays(locale: string) {
  const localeCode = getLocaleCode(locale)
  const days: string[] = []
  // Start from Monday (Jan 5, 2026 is a Monday)
  for (let i = 0; i < 7; i++) {
    const d = new Date(2026, 0, 5 + i)
    days.push(d.toLocaleDateString(localeCode, { weekday: "short" }).slice(0, 2))
  }
  return days
}

export function HeroSection() {
  const router = useRouter()
  const t = useTranslations("Home")
  const locale = useLocale()
  const localeCode = getLocaleCode(locale)
  const weekdays = getWeekdays(locale)

  const [activity, setActivity] = useState("")
  const [activityLabel, setActivityLabel] = useState("")
  const [location, setLocation] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [showActivityDropdown, setShowActivityDropdown] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const activityRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString(localeCode, { day: "numeric", month: "short", year: "numeric" })
  }

  // Build translated activity list
  const activityTypes = activityKeys.map((a) => ({
    icon: a.icon,
    title: t(a.key),
  }))

  // Build translated cities list
  const cities = popularCities.map((c) => ({
    name: t(c.nameKey),
    country: t(c.countryKey),
  }))

  // Filter cities based on typed input
  const filteredCities = location.trim()
    ? cities.filter(
        (city) =>
          city.name.toLowerCase().includes(location.toLowerCase()) ||
          city.country.toLowerCase().includes(location.toLowerCase())
      )
    : cities

  // Calendar days for current view
  const calendarDays = getDaysInMonth(calendarMonth.year, calendarMonth.month)
  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString(localeCode, {
    month: "long",
    year: "numeric",
  })

  // Can't go before current month
  const canGoPrev = calendarMonth.year > today.getFullYear() || (calendarMonth.year === today.getFullYear() && calendarMonth.month > today.getMonth())

  const goToPrevMonth = () => {
    if (!canGoPrev) return
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const goToNextMonth = () => {
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activityRef.current && !activityRef.current.contains(event.target as Node)) {
        setShowActivityDropdown(false)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (activity) params.set("q", activity)
    if (location) params.set("city", location)
    if (selectedDate) params.set("date", selectedDate.toISOString().split("T")[0])
    router.push(`/studios?${params.toString()}`)
  }

  return (
    <section className="px-6 py-4">
      <div className="relative min-h-[640px] rounded-[32px] flex flex-col items-center justify-center p-8">
        {/* Background image layer with overflow-hidden so it respects rounded corners */}
        <div
          className="absolute inset-0 rounded-[32px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.4)), url('/hero-photo-studio.jpeg')`,
          }}
        />

        <div className="relative z-10 w-full max-w-4xl text-center">
          <h1 className="text-white text-4xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-sm text-center">
            {t("heroTitleLine1")} <br /> {t("heroTitleLine2")}
          </h1>

          {/* Search Bar */}
          <div className="bg-white p-4 md:p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch max-w-3xl mx-auto border border-white/20">
            {/* Activity - Simple Dropdown */}
            <div ref={activityRef} className="relative flex-1">
              <button
                onClick={() => {
                  setShowActivityDropdown(!showActivityDropdown)
                  setShowLocationSuggestions(false)
                  setShowDatePicker(false)
                }}
                className="w-full flex items-center justify-center md:justify-start px-4 md:px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-xl md:rounded-l-full md:rounded-r-none h-full text-center md:text-left"
              >
                <span className="material-symbols-outlined text-gray-400 mr-3">search</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400">{t("activityLabel")}</span>
                  <span className={`text-sm font-semibold ${activityLabel ? "text-gray-900" : "text-gray-300"}`}>
                    {activityLabel || t("activityPlaceholder")}
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-300 ml-auto text-lg">expand_more</span>
              </button>

              {/* Activity Dropdown */}
              {showActivityDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full md:w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  {activityTypes.map((type) => (
                    <button
                      key={type.title}
                      onClick={() => {
                        setActivity(type.title)
                        setActivityLabel(type.title)
                        setShowActivityDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        activityLabel === type.title ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-black">{type.icon}</span>
                      <span className="font-semibold text-sm text-gray-900">{type.title}</span>
                      {activityLabel === type.title && (
                        <span className="material-symbols-outlined text-black ml-auto text-lg">check</span>
                      )}
                    </button>
                  ))}
                  {activityLabel && (
                    <button
                      onClick={() => {
                        setActivity("")
                        setActivityLabel("")
                        setShowActivityDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                    >
                      <span className="material-symbols-outlined text-xl text-gray-400">close</span>
                      <span className="font-semibold text-sm text-gray-500">{t("clearSelection")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Location - Typeable Input with Suggestions */}
            <div ref={locationRef} className="relative flex-1">
              <div className="flex items-center justify-center md:justify-start px-4 md:px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 h-full">
                <span className="material-symbols-outlined text-gray-400 mr-3">location_on</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400">{t("locationLabel")}</span>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setShowLocationSuggestions(true)
                    }}
                    onFocus={() => {
                      setShowLocationSuggestions(true)
                      setShowActivityDropdown(false)
                      setShowDatePicker(false)
                    }}
                    placeholder={t("locationPlaceholder")}
                    className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 outline-none bg-transparent w-full"
                  />
                </div>
                {location && (
                  <button
                    onClick={() => {
                      setLocation("")
                      locationInputRef.current?.focus()
                    }}
                    className="text-gray-300 hover:text-gray-500 transition-colors ml-1"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <div className="absolute top-full left-0 mt-2 w-full md:w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  {!location.trim() && (
                    <p className="text-[10px] font-bold uppercase text-gray-400 px-4 py-2">{t("popularCities")}</p>
                  )}
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          setLocation(`${city.name}, ${city.country}`)
                          setShowLocationSuggestions(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{city.name}</p>
                          <p className="text-xs text-gray-500">{city.country}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {t("noSuggestions", { query: location })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date - Custom Calendar Picker */}
            <div ref={dateRef} className="relative flex-1">
              <div
                onClick={() => {
                  setShowDatePicker(!showDatePicker)
                  setShowActivityDropdown(false)
                  setShowLocationSuggestions(false)
                }}
                className="w-full flex items-center justify-center md:justify-start px-4 md:px-6 py-3 md:py-0 hover:bg-gray-50 transition-colors h-full text-center md:text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-gray-400 mr-3">calendar_today</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400">{t("dateLabel")}</span>
                  <span className={`text-sm font-semibold ${selectedDate ? "text-gray-900" : "text-gray-300"}`}>
                    {selectedDate ? formatDisplayDate(selectedDate) : t("datePlaceholder")}
                  </span>
                </div>
                {selectedDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDate(null)
                    }}
                    className="text-gray-300 hover:text-gray-500 transition-colors ml-auto"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {/* Calendar Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goToPrevMonth}
                      disabled={!canGoPrev}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-gray-600 text-xl">chevron_left</span>
                    </button>
                    <span className="text-sm font-bold text-gray-900 capitalize">{monthLabel}</span>
                    <button
                      onClick={goToNextMonth}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-600 text-xl">chevron_right</span>
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {weekdays.map((day) => (
                      <div key={day} className="text-center text-[11px] font-bold text-gray-400 py-1.5">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((date, i) => (
                      <div key={i} className="aspect-square flex items-center justify-center">
                        {date && (
                          <button
                            onClick={() => {
                              setSelectedDate(date)
                              setShowDatePicker(false)
                            }}
                            disabled={date < today}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-all
                              ${date < today ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 hover:text-black"}
                              ${selectedDate && isSameDay(date, selectedDate) ? "bg-black text-white hover:bg-black hover:text-white shadow-sm" : ""}
                              ${isSameDay(date, today) && !(selectedDate && isSameDay(date, selectedDate)) ? "border border-gray-200 text-black font-bold" : ""}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Today shortcut */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedDate(today)
                        setShowDatePicker(false)
                      }}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      {t("today")}
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                      >
                        {t("clear")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-black text-white h-12 md:size-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0 mt-2 md:mt-0 w-full md:w-14 gap-2 md:gap-0"
            >
              <span className="material-symbols-outlined">search</span>
              <span className="md:hidden text-sm font-bold">{t("searchStudios")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
