"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const activityTypes = [
  { icon: "photo_camera", title: "Photography" },
  { icon: "videocam", title: "Film & Video" },
  { icon: "mic", title: "Podcast & Audio" },
  { icon: "music_note", title: "Music Production" },
  { icon: "settings_accessibility", title: "Dance & Movement" },
  { icon: "palette", title: "Art & Gallery" },
]

const popularCities = [
  { name: "Amsterdam", country: "Nederland" },
  { name: "Rotterdam", country: "Nederland" },
  { name: "Den Haag", country: "Nederland" },
  { name: "Utrecht", country: "Nederland" },
  { name: "London", country: "United Kingdom" },
  { name: "Berlin", country: "Germany" },
  { name: "Paris", country: "France" },
  { name: "Antwerpen", country: "Belgium" },
]

export function HeroSection() {
  const router = useRouter()
  const [activity, setActivity] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")

  const [showActivityDropdown, setShowActivityDropdown] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const activityRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  // Filter cities based on typed input
  const filteredCities = location.trim()
    ? popularCities.filter(
        (city) =>
          city.name.toLowerCase().includes(location.toLowerCase()) ||
          city.country.toLowerCase().includes(location.toLowerCase())
      )
    : popularCities

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activityRef.current && !activityRef.current.contains(event.target as Node)) {
        setShowActivityDropdown(false)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (activity) params.set("q", activity)
    if (location) params.set("city", location)
    if (date) params.set("date", date)
    router.push(`/studios?${params.toString()}`)
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0]

  return (
    <section className="px-6 py-4">
      <div
        className="relative min-h-[640px] rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.4)), url('/hero-photo-studio.jpeg')`,
        }}
      >
        <div className="relative z-10 w-full max-w-4xl text-center">
          <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-sm">
            Your next masterpiece <br /> starts here
          </h1>

          {/* Search Bar */}
          <div className="bg-white p-4 md:p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch max-w-3xl mx-auto border border-white/20">
            {/* Activity - Simple Dropdown */}
            <div ref={activityRef} className="relative flex-1">
              <button
                onClick={() => {
                  setShowActivityDropdown(!showActivityDropdown)
                  setShowLocationSuggestions(false)
                }}
                className="w-full flex items-center px-4 md:px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-colors rounded-xl md:rounded-l-full md:rounded-r-none h-full text-left"
              >
                <span className="material-symbols-outlined text-gray-400 mr-3">search</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Activity</span>
                  <span className={`text-sm font-semibold ${activity ? "text-gray-900" : "text-gray-300"}`}>
                    {activity || "What are you creating?"}
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
                        setShowActivityDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                        activity === type.title ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-primary">{type.icon}</span>
                      <span className="font-semibold text-sm text-gray-900">{type.title}</span>
                      {activity === type.title && (
                        <span className="material-symbols-outlined text-primary ml-auto text-lg">check</span>
                      )}
                    </button>
                  ))}
                  {activity && (
                    <button
                      onClick={() => {
                        setActivity("")
                        setShowActivityDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                    >
                      <span className="material-symbols-outlined text-xl text-gray-400">close</span>
                      <span className="font-semibold text-sm text-gray-500">Clear selection</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Location - Typeable Input with Suggestions */}
            <div ref={locationRef} className="relative flex-1">
              <div className="flex items-center px-4 md:px-6 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 h-full">
                <span className="material-symbols-outlined text-gray-400 mr-3">location_on</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Location</span>
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setShowLocationSuggestions(true)
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    placeholder="Type a city..."
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
                    <p className="text-[10px] font-bold uppercase text-gray-400 px-4 py-2">Popular cities</p>
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
                      No suggestions found. You can still search for &quot;{location}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date - Simple Date Input */}
            <div className="relative flex-1">
              <div className="flex items-center px-4 md:px-6 py-3 md:py-0 hover:bg-gray-50 transition-colors h-full">
                <span className="material-symbols-outlined text-gray-400 mr-3">calendar_today</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    className="text-sm font-semibold text-gray-900 outline-none bg-transparent w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ colorScheme: "light" }}
                  />
                </div>
                {date && (
                  <button
                    onClick={() => setDate("")}
                    className="text-gray-300 hover:text-gray-500 transition-colors ml-1"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-primary text-white h-12 md:size-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0 mt-2 md:mt-0 w-full md:w-14 gap-2 md:gap-0"
            >
              <span className="material-symbols-outlined">search</span>
              <span className="md:hidden text-sm font-bold">Search Studios</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
