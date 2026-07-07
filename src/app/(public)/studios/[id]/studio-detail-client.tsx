"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface StudioDetailClientProps {
  studio: any
  reviews: any[]
  similarStudios: any[]
}

type TabType = "photos" | "amenities" | "tour" | "dates" | "location" | "reviews"

export function StudioDetailClient({ studio, reviews, similarStudios }: StudioDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photos")
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [crewSize, setCrewSize] = useState(1)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isFavorite, setIsFavorite] = useState(false)
  const [isContactingHost, setIsContactingHost] = useState(false)
  const router = useRouter()

  const datePickerRef = useRef<HTMLDivElement>(null)

  const handleContactHost = async () => {
    if (!studio.host?.id || isContactingHost) return
    setIsContactingHost(true)
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: studio.host.id, studio_id: studio.id }),
      })
      if (res.status === 401) {
        router.push(`/login?redirect=/studios/${studio.id}`)
        return
      }
      if (!res.ok) throw new Error("Failed to start conversation")
      router.push("/messages")
    } catch (error) {
      console.error("Error contacting host:", error)
      setIsContactingHost(false)
    }
  }

  // Get images from studio_images or images array
  const images = studio.studio_images?.map((img: any) => img.url) || studio.images || []
  const amenities = studio.studio_amenities || []
  const equipment = studio.equipment || []
  const ratingBreakdown = studio.rating_breakdown || {}

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatDateRange = () => {
    if (!checkIn && !checkOut) return "Add dates"
    if (checkIn && !checkOut) return formatDate(checkIn)
    if (checkIn && checkOut) return `${formatDate(checkIn)} - ${formatDate(checkOut)}`
    return "Add dates"
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
      days.push(null)
    }

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

  // Calculate pricing
  const pricePerHour = studio.price_per_hour || 75
  const pricePerDay = studio.price_per_day || pricePerHour * 8
  const days = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 1
  const subtotal = days * pricePerDay
  const serviceFee = Math.round(subtotal * 0.12)
  const total = subtotal + serviceFee

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "photos", label: "Photos", icon: "photo_library" },
    { id: "amenities", label: "Amenities", icon: "list" },
    { id: "tour", label: "Virtual tour", icon: "view_in_ar" },
    { id: "dates", label: "Available dates", icon: "calendar_today" },
    { id: "location", label: "Location", icon: "location_on" },
    { id: "reviews", label: "Reviews", icon: "star" },
  ]

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/studios" className="text-gray-500 hover:text-gray-900">Studios</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/studios?city=${studio.city || "Amsterdam"}`} className="text-gray-500 hover:text-gray-900">
            {studio.city || "Amsterdam"}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{studio.title}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-3xl overflow-hidden">
          <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            {images[0] && (
              <Image
                src={images[0]}
                alt={studio.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          {images.slice(1, 5).map((image: string, index: number) => (
            <div key={index} className="relative group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
              <Image
                src={image}
                alt={`${studio.title} ${index + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{images.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons overlay */}
        <div className="flex justify-end gap-3 -mt-16 mr-4 relative z-10">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-lg">ios_share</span>
            Share
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
          >
            <span className={`material-symbols-outlined text-lg ${isFavorite ? "text-red-500" : ""}`}>
              {isFavorite ? "favorite" : "favorite_border"}
            </span>
            Save
          </button>
          <button
            onClick={() => setShowAllPhotos(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            Show all photos
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Title & Meta */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {studio.is_superhost && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                    Superhost
                  </span>
                )}
                <span className="text-gray-500 text-sm capitalize">{studio.studio_type || "Daylight"} Studio</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{studio.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-lg">star</span>
                  <span className="font-bold">{studio.avg_rating || 4.9}</span>
                  <span className="text-gray-500">({studio.total_reviews || reviews.length} reviews)</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {studio.location || `${studio.city}, Netherlands`}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8 sticky top-0 bg-[#fcfcfc] z-20">
              <div className="flex gap-1 overflow-x-auto pb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">About this studio</h2>
                <p className="text-gray-600 leading-relaxed">{studio.description}</p>
                {studio.size_sqm && (
                  <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">square_foot</span>
                      <span>{studio.size_sqm}m²</span>
                    </div>
                    {studio.max_guests && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">group</span>
                        <span>Up to {studio.max_guests} people</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Host Info */}
              {studio.host && (
                <div className="flex items-start gap-6 p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="relative">
                    <div className="size-16 rounded-full overflow-hidden bg-gray-200">
                      {studio.host.avatar_url ? (
                        <Image
                          src={studio.host.avatar_url}
                          alt={studio.host.full_name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-3xl">person</span>
                        </div>
                      )}
                    </div>
                    {studio.host.is_verified && (
                      <div className="absolute -bottom-1 -right-1 size-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-sm">verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Hosted by {studio.host.full_name}</h3>
                    <p className="text-gray-500 text-sm mb-3">
                      Member since {new Date(studio.host.created_at).getFullYear()}
                    </p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      {studio.host.response_time && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                          Responds {studio.host.response_time}
                        </span>
                      )}
                      {studio.host.response_rate && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-lg">chat</span>
                          {studio.host.response_rate}% response rate
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleContactHost}
                    disabled={isContactingHost}
                    className="px-6 py-3 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isContactingHost ? "Starting chat..." : "Contact Host"}
                  </button>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">What this place offers</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity: any, index: number) => (
                      <div
                        key={amenity.id || index}
                        className="flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-2xl text-primary mb-3">
                          {amenity.icon || "check_circle"}
                        </span>
                        <span className="font-bold text-sm mb-1">{amenity.name}</span>
                        {amenity.description && (
                          <span className="text-xs text-gray-500">{amenity.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {equipment.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Equipment & Add-ons</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${item.included ? "text-green-500" : "text-gray-400"}`}>
                            {item.included ? "check_circle" : "add_circle"}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.included ? (
                          <span className="text-sm text-green-600 font-medium">Included</span>
                        ) : (
                          <span className="text-sm text-gray-500">+€{item.price}/day</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual Tour Preview */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Virtual Tour</h2>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer">
                  {images[0] && (
                    <Image
                      src={images[0]}
                      alt="Virtual tour preview"
                      fill
                      className="object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="size-20 bg-white/90 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-4xl text-primary">play_arrow</span>
                    </div>
                    <p className="text-white font-bold text-lg">Explore in 360°</p>
                    <p className="text-white/70 text-sm">Click to start virtual tour</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-primary">star</span>
                    <span className="text-3xl font-bold">{studio.avg_rating || 4.9}</span>
                    <span className="text-gray-500">• {studio.total_reviews || reviews.length} reviews</span>
                  </div>
                  <button className="px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors">
                    See all reviews
                  </button>
                </div>

                {/* Rating Breakdown */}
                {Object.keys(ratingBreakdown).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-6 bg-white rounded-2xl border border-gray-100">
                    {Object.entries(ratingBreakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${((value as number) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{value as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-6 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="size-12 rounded-full overflow-hidden bg-gray-200">
                          {review.reviewer?.avatar_url ? (
                            <Image
                              src={review.reviewer.avatar_url}
                              alt={review.reviewer.full_name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="material-symbols-outlined">person</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{review.reviewer?.full_name || "Anonymous"}</p>
                          <p className="text-sm text-gray-500">{formatReviewDate(review.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`material-symbols-outlined text-lg ${
                              i < review.rating ? "text-amber-400" : "text-gray-200"
                            }`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Location</h2>
                <div className="aspect-[2/1] rounded-2xl overflow-hidden bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">map</span>
                      <p className="text-gray-500">Map view</p>
                      <p className="text-sm text-gray-400">{studio.location || `${studio.city}, Netherlands`}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">
                  Exact location provided after booking confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">€{pricePerHour}</span>
                    <span className="text-gray-500">/ hour</span>
                  </div>
                  <p className="text-sm text-gray-500">or €{pricePerDay}/day (8 hours)</p>
                </div>

                {/* Date Selection */}
                <div ref={datePickerRef} className="relative mb-4">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 transition-colors"
                  >
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Dates</span>
                    <span className={`font-medium ${checkIn ? "text-gray-900" : "text-gray-400"}`}>
                      {formatDateRange()}
                    </span>
                  </button>

                  {/* Date Picker Dropdown */}
                  {showDatePicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <span className="font-bold">
                          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                          <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, i) => (
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

                      {(checkIn || checkOut) && (
                        <button
                          onClick={() => { setCheckIn(null); setCheckOut(null) }}
                          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Crew Size */}
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-2">Crew size</span>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCrewSize(Math.max(1, crewSize - 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="font-bold text-lg">{crewSize} {crewSize === 1 ? "person" : "people"}</span>
                    <button
                      onClick={() => setCrewSize(Math.min(studio.max_guests || 20, crewSize + 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                {checkIn && (
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">€{pricePerDay} x {days} day{days > 1 ? "s" : ""}</span>
                      <span>€{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span>€{serviceFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3">
                      <span>Total</span>
                      <span>€{total}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                  {checkIn ? "Reserve" : "Check availability"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>

                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <p className="text-xs text-gray-500 mt-1">Verified</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary">bolt</span>
                    <p className="text-xs text-gray-500 mt-1">Instant book</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    <p className="text-xs text-gray-500 mt-1">Free cancellation</p>
                  </div>
                </div>
              </div>

              {/* Report Link */}
              <div className="mt-4 text-center">
                <button className="text-sm text-gray-500 hover:text-gray-900 underline">
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Studios */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Similar studios nearby</h2>
            <Link href="/studios" className="text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarStudios.map((similarStudio: any) => {
              const studioImage = similarStudio.images?.[0] || similarStudio.studio_images?.[0]?.url
              return (
                <Link key={similarStudio.id} href={`/studios/${similarStudio.id}`} className="group">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative bg-gray-200">
                    {studioImage && (
                      <Image
                        src={studioImage}
                        alt={similarStudio.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-3 right-3 size-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-lg">favorite_border</span>
                    </button>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold group-hover:text-primary transition-colors">{similarStudio.title}</h3>
                      <p className="text-sm text-gray-500">{similarStudio.location || similarStudio.city}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-base text-primary">star</span>
                      <span className="font-medium">{similarStudio.avg_rating || 4.8}</span>
                    </div>
                  </div>
                  <p className="mt-2">
                    <span className="font-bold">€{similarStudio.price_per_hour}</span>
                    <span className="text-gray-500"> / hour</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full font-medium"
            >
              <span className="material-symbols-outlined">close</span>
              Close
            </button>
          </div>
          <div className="h-full overflow-y-auto py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {images.map((image: string, index: number) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${studio.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">€{pricePerHour}</span>
              <span className="text-gray-500 text-sm">/ hour</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-primary text-sm">star</span>
              <span className="font-medium">{studio.avg_rating || 4.9}</span>
              <span className="text-gray-500">({studio.total_reviews || reviews.length})</span>
            </div>
          </div>
          <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl">
            Check availability
          </button>
        </div>
      </div>
    </div>
  )
}
