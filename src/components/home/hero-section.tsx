"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const activityTypes = [
  { icon: "photo_camera", title: "Photography", description: "Fashion, portrait, product, and commercial shoots." },
  { icon: "videocam", title: "Film & Video", description: "Music videos, interviews, and cinematic productions." },
  { icon: "mic", title: "Podcast & Audio", description: "Professional sound recording and voice-over booths." },
  { icon: "music_note", title: "Music Production", description: "Mix, master, and record with top-tier gear." },
  { icon: "settings_accessibility", title: "Dance & Movement", description: "Sprung floors and mirror walls for rehearsals." },
  { icon: "palette", title: "Art & Gallery", description: "Pop-up exhibitions and fine art ateliers." },
]

const popularCities = [
  { name: "Amsterdam", country: "Netherlands", code: "NL" },
  { name: "London", country: "United Kingdom", code: "UK" },
  { name: "Berlin", country: "Germany", code: "DE" },
  { name: "Paris", country: "France", code: "FR" },
]

export function HeroSection() {
  const router = useRouter()
  const [activity, setActivity] = useState("")
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const locationRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
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
    if (checkIn) params.set("date", checkIn.toISOString().split("T")[0])
    router.push(`/studios?${params.toString()}`)
  }

  const formatDateRange = () => {
    if (!checkIn && !checkOut) return "Add dates"
    if (checkIn && !checkOut) return formatDate(checkIn)
    if (checkIn && checkOut) return `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`
    return "Add dates"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handleDateClick = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date)
      setCheckOut(null)
    } else if (date > checkIn) {
      setCheckOut(date)
    } else {
      setCheckIn(date)
      setCheckOut(null)
    }
  }

  const clearDates = () => {
    setCheckIn(null)
    setCheckOut(null)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of month
    for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
      days.push(null)
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false
    return date > checkIn && date < checkOut
  }

  const isDateSelected = (date: Date) => {
    if (checkIn && date.toDateString() === checkIn.toDateString()) return true
    if (checkOut && date.toDateString() === checkOut.toDateString()) return true
    return false
  }

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

  return (
    <>
      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 md:pt-32 px-4">
          <div
            className="absolute inset-0 bg-black/5 backdrop-blur-sm"
            onClick={() => setShowActivityModal(false)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-6 md:p-10 border border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold">What are you creating?</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {activityTypes.map((type) => (
                <button
                  key={type.title}
                  onClick={() => {
                    setActivity(type.title)
                    setShowActivityModal(false)
                  }}
                  className="flex flex-col items-start p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-50 hover:bg-gray-50 hover:border-gray-100 transition-all group text-left"
                >
                  <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl md:text-2xl text-primary">
                      {type.icon}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 mb-1 text-sm md:text-base">{type.title}</span>
                  <span className="text-xs text-gray-500 leading-relaxed">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="px-6 py-4">
        <div
          className="relative min-h-[640px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2940&auto=format&fit=crop')`,
          }}
        >
          <div className="relative z-10 w-full max-w-4xl text-center">
            <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-sm">
              Your next masterpiece <br /> starts here
            </h1>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-stretch max-w-3xl mx-auto border border-white/20">
              {/* Activity */}
              <button
                onClick={() => setShowActivityModal(true)}
                className="flex-1 flex items-center px-4 md:px-6 py-3 md:py-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-full md:rounded-l-full md:rounded-r-none text-left"
              >
                <span className="material-symbols-outlined text-gray-400 mr-3">search</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Activity</span>
                  <span className={`text-sm font-semibold ${activity ? "text-gray-900" : "text-gray-300"}`}>
                    {activity || "What are you creating?"}
                  </span>
                </div>
              </button>

              {/* Location */}
              <div ref={locationRef} className="relative flex-1">
                <button
                  onClick={() => {
                    setShowLocationDropdown(!showLocationDropdown)
                    setShowDatePicker(false)
                  }}
                  className="w-full flex items-center px-4 md:px-6 py-3 md:py-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors h-full text-left"
                >
                  <span className="material-symbols-outlined text-gray-400 mr-3">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Location</span>
                    <span className={`text-sm font-semibold ${location ? "text-gray-900" : "text-gray-300"}`}>
                      {location || "Near Amsterdam"}
                    </span>
                  </div>
                </button>

                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50">
                    <div className="flex gap-4">
                      {/* Popular Cities */}
                      <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 px-2">Popular Cities</h3>
                        <div className="space-y-1">
                          {popularCities.map((city) => (
                            <button
                              key={city.name}
                              onClick={() => {
                                setLocation(`${city.name}, ${city.code}`)
                                setShowLocationDropdown(false)
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                                location.includes(city.name) ? "bg-gray-50" : ""
                              }`}
                            >
                              <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {city.code}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{city.name}</p>
                                <p className="text-xs text-gray-500">{city.country}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div ref={dateRef} className="relative flex-1">
                <button
                  onClick={() => {
                    setShowDatePicker(!showDatePicker)
                    setShowLocationDropdown(false)
                  }}
                  className="w-full flex items-center px-4 md:px-6 py-3 md:py-0 hover:bg-gray-50 transition-colors h-full text-left"
                >
                  <span className="material-symbols-outlined text-gray-400 mr-3">calendar_today</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Date</span>
                    <span className={`text-sm font-semibold ${checkIn ? "text-gray-900" : "text-gray-300"}`}>
                      {formatDateRange()}
                    </span>
                  </div>
                </button>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full right-0 md:right-0 left-0 md:left-auto mt-2 w-full md:w-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 md:p-6 z-50">
                    <div className="flex gap-2 mb-4">
                      <button className="text-xs font-bold uppercase text-gray-400 px-3 py-1">Popular Cities</button>
                      <button className="text-xs font-bold uppercase text-primary px-3 py-1 border-b-2 border-primary">Select Dates</button>
                    </div>

                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <span className="material-symbols-outlined text-gray-400">chevron_left</span>
                      </button>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                      </button>
                    </div>

                    {/* Two Month Calendar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[currentMonth, nextMonth].map((month, monthIndex) => (
                        <div key={monthIndex}>
                          <h4 className="text-center font-bold mb-4">
                            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </h4>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => (
                              <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
                            ))}
                            {getDaysInMonth(month).map((date, i) => (
                              <div key={i} className="aspect-square">
                                {date && (
                                  <button
                                    onClick={() => handleDateClick(date)}
                                    disabled={date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    className={`w-full h-full rounded-full text-sm font-medium transition-colors
                                      ${date < new Date(new Date().setHours(0, 0, 0, 0)) ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                                      ${isDateSelected(date) ? "bg-primary text-white hover:bg-primary" : ""}
                                      ${isDateInRange(date) ? "bg-primary/10" : ""}
                                    `}
                                  >
                                    {date.getDate()}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Date Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-gray-400">Check in</span>
                          <p className="font-semibold">{checkIn ? formatShortDate(checkIn) : "—"}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-gray-400">Check out</span>
                          <p className="font-semibold">{checkOut ? formatShortDate(checkOut) : "—"}</p>
                        </div>
                      </div>
                      <button
                        onClick={clearDates}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-900"
                      >
                        Clear dates
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="bg-primary text-white size-12 md:size-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0 mt-2 md:mt-0 mx-auto md:mx-0"
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
