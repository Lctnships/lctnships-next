"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import dynamic from "next/dynamic"

const StudioMap = dynamic(
  () => import("@/components/shared/studio-map").then((mod) => mod.StudioMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" /> }
)

interface StudioDetailClientProps {
  studio: any
  reviews: any[]
  similarStudios: any[]
}

type TabType = "photos" | "amenities" | "tour" | "dates" | "location" | "reviews"

export function StudioDetailClient({ studio, reviews, similarStudios }: StudioDetailClientProps) {
  const t = useTranslations("StudioDetail")
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<TabType>("photos")
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookingHours, setBookingHours] = useState(studio.min_hours || 2)
  const [startTime, setStartTime] = useState("09:00")
  const [crewSize, setCrewSize] = useState(1)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showMobileBooking, setShowMobileBooking] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [isFavorite, setIsFavorite] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set())

  const router = useRouter()
  const { user } = useUser()
  const datePickerRef = useRef<HTMLDivElement>(null)
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  // Check favorite status on mount
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("studio_id", studio.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsFavorite(true)
      })
  }, [user, studio.id])

  const handleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/studios/${studio.id}`)
      return
    }

    const newState = !isFavorite
    setIsFavorite(newState) // Optimistic update

    try {
      if (newState) {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studio_id: studio.id }),
        })
        if (!res.ok) throw new Error()
      } else {
        const res = await fetch(`/api/favorites?studioId=${studio.id}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error()
      }
    } catch {
      setIsFavorite(!newState) // Revert on error
    }
  }

  const handleContactHost = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/studios/${studio.id}`)
      return
    }

    router.push(`/messages?studio=${studio.id}&host=${studio.host?.id}`)
  }

  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: studio.title,
      text: `${studio.title} - ${studio.location || studio.city}`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        // Fallback for restricted contexts (iframes, older browsers)
        const textArea = document.createElement("textarea")
        textArea.value = url
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  const scrollToSection = (tabId: TabType) => {
    setActiveTab(tabId)

    // Special case: open date picker when dates tab is clicked
    if (tabId === "dates") {
      setShowDatePicker(true)
    }

    const element = document.getElementById(`section-${tabId}`)
    if (element) {
      const offset = 70 // account for sticky tab bar
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // Get images from studio_images or images array
  const studioImageUrls = studio.studio_images?.map((img: any) => img.url) || []
  const images = studioImageUrls.length > 0 ? studioImageUrls : (studio.images || [])
  const amenities = studio.studio_amenities || []
  const equipment = studio.equipment || []
  const ratingBreakdown = studio.rating_breakdown || {}

  useEffect(() => {
    setMounted(true)
  }, [])

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
    return date.toLocaleDateString(dateLocale, { month: "short", day: "numeric" })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDatePicker(false)
  }

  const toggleEquipment = (id: string) => {
    setSelectedEquipment((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBooking = () => {
    if (!selectedDate) {
      setShowDatePicker(true)
      return
    }

    const params = new URLSearchParams()
    params.set("date", selectedDate.toISOString().split("T")[0])
    params.set("start", startTime)
    params.set("duration", bookingHours.toString())
    params.set("crew", crewSize.toString())

    // Add selected equipment
    selectedEquipment.forEach((eqId) => {
      params.set(`eq_${eqId}`, "1")
    })

    router.push(`/book/${studio.id}/session?${params.toString()}`)
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

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  // Calculate pricing
  const pricePerHour = studio.price_per_hour || 75
  const pricePerDay = studio.price_per_day || pricePerHour * 8
  const minHours = studio.min_hours || 2
  const equipmentTotal = equipment
    .filter((item: any) => !item.included && selectedEquipment.has(item.id))
    .reduce((sum: number, item: any) => sum + (item.price || 0), 0)
  const subtotal = bookingHours * pricePerHour + equipmentTotal
  const serviceFee = Math.round(subtotal * 0.12)
  const total = subtotal + serviceFee

  // Generate time slots (6:00 - 22:00)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6
    return `${hour.toString().padStart(2, "0")}:00`
  })
  const endTimeHour = parseInt(startTime.split(":")[0]) + bookingHours
  const endTime = `${endTimeHour.toString().padStart(2, "0")}:00`

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "photos", label: t("photosTab"), icon: "photo_library" },
    { id: "amenities", label: t("amenitiesTab"), icon: "list" },
    { id: "tour", label: t("virtualTourTab"), icon: "view_in_ar" },
    { id: "dates", label: t("availableDatesTab"), icon: "calendar_today" },
    { id: "location", label: t("locationTab"), icon: "location_on" },
    { id: "reviews", label: t("reviewsTab"), icon: "star" },
  ]

  const dayNames = [
    t("dayMon"), t("dayTue"), t("dayWed"), t("dayThu"),
    t("dayFri"), t("daySat"), t("daySun"),
  ]

  const formatReviewDate = (dateString: string) => {
    if (!mounted) {
      // Return ISO date substring as consistent placeholder for SSR/client hydration
      return dateString ? dateString.substring(0, 10) : ""
    }
    const date = new Date(dateString)
    return date.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
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
      <section id="section-photos" className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-3 h-[250px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="col-span-1 md:col-span-2 md:row-span-2 relative group cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            {images[0] && (
              <Image
                src={images[0]}
                alt={studio.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {/* Mobile: show photo count overlay */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 md:hidden px-3 py-1.5 bg-black/60 rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-white text-sm">photo_library</span>
                <span className="text-white text-xs font-medium">{images.length} {t("photosTab").toLowerCase()}</span>
              </div>
            )}
          </div>
          {images.slice(1, 5).map((image: string, index: number) => (
            <div key={index} className="relative group cursor-pointer hidden md:block" onClick={() => setShowAllPhotos(true)}>
              <Image
                src={image}
                alt={`${studio.title} ${index + 2}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{t("morePhotos", { count: images.length - 5 })}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons overlay */}
        <div className="flex justify-end gap-2 md:gap-3 -mt-12 md:-mt-16 mr-3 md:mr-4 relative z-10">
          <button onClick={handleShare} className="relative flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium">
            <span className="material-symbols-outlined text-base md:text-lg">ios_share</span>
            <span className="hidden md:inline">{t("share")}</span>
            {showCopied && (
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                {t("linkCopied") || "Link gekopieerd!"}
              </span>
            )}
          </button>
          <button
            onClick={handleFavorite}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
          >
            <span className={`material-symbols-outlined text-base md:text-lg ${isFavorite ? "text-red-500" : ""}`}>
              {isFavorite ? "favorite" : "favorite_border"}
            </span>
            <span className="hidden md:inline">{t("save")}</span>
          </button>
          <button
            onClick={() => setShowAllPhotos(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-base md:text-lg">grid_view</span>
            <span className="hidden md:inline">{t("showAllPhotos")}</span>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-28 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Title & Meta */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {studio.is_superhost && (
                  <span className="px-3 py-1 bg-gray-100 text-black text-xs font-bold rounded-full uppercase tracking-wide">
                    {t("superhost")}
                  </span>
                )}
                <span className="text-gray-500 text-sm capitalize">{studio.studio_type || "Daylight"} Studio</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{studio.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-black text-lg">star</span>
                  <span className="font-bold">{studio.avg_rating || 4.9}</span>
                    <span className="text-gray-500">({t("reviewsCount", { count: studio.total_reviews || reviews.length })})</span>
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
                    onClick={() => scrollToSection(tab.id)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 py-3 md:px-5 md:py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base md:text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">{t("aboutThisStudio")}</h2>
                <p className="text-gray-600 leading-relaxed">{studio.description}</p>
                {studio.size_sqm && (
                  <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-black">square_foot</span>
                      <span>{studio.size_sqm}m²</span>
                    </div>
                    {studio.max_guests && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-black">group</span>
                        <span>{t("upToGuests", { count: studio.max_guests })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Host Info */}
              {studio.host && (
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="size-14 md:size-16 rounded-full overflow-hidden bg-gray-200">
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
                        <div className="absolute -bottom-1 -right-1 size-6 bg-black rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg">{t("hostedBy", { name: studio.host.full_name })}</h3>
                      <p className="text-gray-500 text-sm mb-2 md:mb-3">
                        {t("memberSince", { year: new Date(studio.host.created_at).getFullYear() })}
                      </p>
                      <div className="flex items-center gap-3 md:gap-4 text-sm flex-wrap">
                        {studio.host.response_time && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-black text-base md:text-lg">schedule</span>
                            {t("respondsIn", { time: studio.host.response_time })}
                          </span>
                        )}
                        {studio.host.response_rate && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-black text-base md:text-lg">chat</span>
                            {t("responseRate", { rate: studio.host.response_rate })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleContactHost} className="w-full md:w-auto px-6 py-3 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors text-center">
                    {t("contactHost")}
                  </button>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div id="section-amenities">
                  <h2 className="text-2xl font-bold mb-6">{t("whatThisSpaceOffers")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity: any, index: number) => (
                      <div
                        key={amenity.id || index}
                        className="flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:border-black/20 hover:shadow-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-2xl text-black mb-3">
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
                  <h2 className="text-2xl font-bold mb-6">{t("equipmentExtras")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.map((item: any) => {
                      const isSelected = !item.included && selectedEquipment.has(item.id)
                      return (
                        <div
                          key={item.id}
                          onClick={!item.included ? () => toggleEquipment(item.id) : undefined}
                          className={`flex items-center justify-between p-4 bg-white rounded-xl border transition-all
                            ${item.included
                              ? "border-gray-100"
                              : isSelected
                                ? "border-green-500 ring-1 ring-green-500 cursor-pointer"
                                : "border-gray-100 hover:border-gray-300 cursor-pointer"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${item.included || isSelected ? "text-green-500" : "text-gray-400"}`}>
                              {item.included || isSelected ? "check_circle" : "add_circle"}
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          {item.included ? (
                            <span className="text-sm text-green-600 font-medium">{t("included")}</span>
                          ) : isSelected ? (
                            <span className="text-sm text-green-600 font-medium">{t("added")}</span>
                          ) : (
                            <span className="text-sm text-gray-500">+€{item.price}{t("perDay")}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Virtual Tour Preview */}
              <div id="section-tour">
                <h2 className="text-2xl font-bold mb-6">{t("virtualTour")}</h2>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer">
                  {images[0] && (
                    <Image
                      src={images[0]}
                      alt="Virtual tour preview"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="size-20 bg-white/90 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-4xl text-black">play_arrow</span>
                    </div>
                    <p className="text-white font-bold text-lg">{t("discover360")}</p>
                    <p className="text-white/70 text-sm">{t("clickToStartTour")}</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div id="section-reviews">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-black">star</span>
                    <span className="text-2xl md:text-3xl font-bold">{studio.avg_rating || 4.9}</span>
                    <span className="text-gray-500 text-sm md:text-base">• {t("reviewsCount", { count: studio.total_reviews || reviews.length })}</span>
                  </div>
                  <button className="px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto text-center">
                    {t("allReviews")}
                  </button>
                </div>

                {/* Rating Breakdown */}
                {Object.keys(ratingBreakdown).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8 p-4 md:p-6 bg-white rounded-2xl border border-gray-100">
                    {Object.entries(ratingBreakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-sm capitalize shrink-0">{key}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 md:w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-4 md:p-6 bg-white rounded-2xl border border-gray-100">
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
                          <p className="font-bold">{review.reviewer?.full_name || t("anonymous")}</p>
                          <p className="text-sm text-gray-500" suppressHydrationWarning>{formatReviewDate(review.created_at)}</p>
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
              <div id="section-location" className="mt-12">
                <h2 className="text-2xl font-bold mb-6">{t("location")}</h2>
                {studio.latitude && studio.longitude ? (
                  <StudioMap
                    lat={studio.latitude}
                    lng={studio.longitude}
                    city={studio.location || `${studio.city}, Netherlands`}
                    className="aspect-[4/3] md:aspect-[2/1] h-[250px] md:h-auto md:min-h-[280px]"
                  />
                ) : (
                  <div className="aspect-[4/3] md:aspect-[2/1] h-[250px] md:h-auto md:min-h-[280px] rounded-2xl overflow-hidden bg-gray-100 relative flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">map</span>
                      <p className="text-gray-400">{studio.location || `${studio.city}, Netherlands`}</p>
                    </div>
                  </div>
                )}
                {(studio.address || studio.location || studio.city) && (
                  <div className="mt-4 flex items-start gap-2">
                    <span className="material-symbols-outlined text-gray-500 text-lg mt-0.5">location_on</span>
                    <div>
                      {studio.address && (
                        <p className="font-medium text-gray-900">{studio.address}</p>
                      )}
                      <p className="text-gray-500 text-sm">
                        {studio.location || `${studio.city || "Amsterdam"}, Netherlands`}
                        {studio.postal_code && ` · ${studio.postal_code}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget (hidden on mobile, uses fixed bottom bar instead) */}
          <div className="hidden lg:block lg:col-span-1">
            <div id="section-dates" className="sticky top-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">€{pricePerHour}</span>
                    <span className="text-gray-500">{t("perHour")}</span>
                  </div>
                  <p className="text-sm text-gray-500">of €{pricePerDay}{t("perDayHours")}</p>
                </div>

                {/* Date Selection */}
                <div ref={datePickerRef} className="relative mb-4">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 transition-colors"
                  >
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("date")}</span>
                    <span className={`font-medium ${selectedDate ? "text-gray-900" : "text-gray-400"}`}>
                      {selectedDate ? formatDate(selectedDate) : t("selectDate")}
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
                          {currentMonth.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {dayNames.map((day) => (
                          <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, i) => (
                          <div key={i} className="aspect-square">
                            {date && (
                              <button
                                onClick={() => handleDateClick(date)}
                                disabled={date < today}
                                className={`w-full h-full rounded-full text-sm font-medium transition-colors
                                  ${date < today ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                                  ${isDateSelected(date) ? "bg-black text-white hover:bg-gray-800" : ""}
                                `}
                              >
                                {date.getDate()}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {selectedDate && (
                        <button
                          onClick={() => setSelectedDate(null)}
                          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
                        >
                          {t("clearDates")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("startTime")}</span>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full font-medium bg-transparent outline-none cursor-pointer"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("endTime")}</span>
                    <span className="font-medium text-gray-600">{endTime}</span>
                  </div>
                </div>

                {/* Duration / Hours */}
                <div className="mb-4 p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase text-gray-400">{t("duration")}</span>
                    <span className="text-xs text-black font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">info</span>
                      {t("minHours", { count: minHours })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setBookingHours(Math.max(minHours, bookingHours - 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                      disabled={bookingHours <= minHours}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="font-bold text-lg">{bookingHours} {t("hoursUnit")}</span>
                    <button
                      onClick={() => setBookingHours(Math.min(12, bookingHours + 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Crew Size */}
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-2">{t("crewSize")}</span>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCrewSize(Math.max(1, crewSize - 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="font-bold text-lg">{crewSize} {crewSize === 1 ? t("person") : t("people")}</span>
                    <button
                      onClick={() => setCrewSize(Math.min(studio.max_guests || 20, crewSize + 1))}
                      className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">€{pricePerHour} × {bookingHours} {t("hoursUnit")}</span>
                    <span>€{bookingHours * pricePerHour}</span>
                  </div>
                  {equipmentTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("equipmentTotal")}</span>
                      <span>€{equipmentTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("serviceFees")}</span>
                    <span>€{serviceFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3">
                    <span>{t("total")}</span>
                    <span>€{total}</span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {selectedDate ? t("reserve") : t("checkAvailability")}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">{t("notChargedYet")}</p>

                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-black">verified</span>
                    <p className="text-xs text-gray-500 mt-1">{t("verified")}</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-black">bolt</span>
                    <p className="text-xs text-gray-500 mt-1">{t("instantBook")}</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-black">event_available</span>
                    <p className="text-xs text-gray-500 mt-1">{t("freeCancellation")}</p>
                  </div>
                </div>
              </div>

              {/* Report Link */}
              <div className="mt-4 text-center">
                <button className="text-sm text-gray-500 hover:text-gray-900 underline">
                  {t("report")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Studios */}
        <section className="mt-20">
          <div className="flex items-start justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">{t("similarStudiosNearby")}</h2>
            <Link href="/studios" className="text-black font-medium hover:underline whitespace-nowrap shrink-0">
              {t("viewAll")}
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (!user) {
                          router.push(`/login?redirect=/studios/${studio.id}`)
                          return
                        }
                        fetch("/api/favorites", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ studio_id: similarStudio.id }),
                        })
                      }}
                      className="absolute top-3 right-3 size-9 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-lg">favorite_border</span>
                    </button>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold group-hover:text-black transition-colors">{similarStudio.title}</h3>
                      <p className="text-sm text-gray-500">{similarStudio.location || similarStudio.city}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-base text-black">star</span>
                      <span className="font-medium">{similarStudio.avg_rating || 4.8}</span>
                    </div>
                  </div>
                  <p className="mt-2">
                    <span className="font-bold">€{similarStudio.price_per_hour}</span>
                    <span className="text-gray-500"> {t("perHour")}</span>
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
              {t("close")}
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <span className="text-gray-500 text-sm">{t("perHour")}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-black text-sm">star</span>
              <span className="font-medium">{studio.avg_rating || 4.9}</span>
              <span className="text-gray-500">({studio.total_reviews || reviews.length})</span>
            </div>
          </div>
          <button
            onClick={() => setShowMobileBooking(true)}
            className="px-6 md:px-8 py-3 bg-black text-white font-bold rounded-xl text-sm md:text-base"
          >
            {t("checkAvailability")}
          </button>
        </div>
      </div>

      {/* Mobile Booking Sheet */}
      {showMobileBooking && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileBooking(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">{t("bookThisStudio")}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">€{pricePerHour}</span>
                    <span className="text-gray-500">{t("perHour")}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileBooking(false)}
                  className="size-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Date */}
              <div className="mb-4">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 transition-colors"
                >
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("date")}</span>
                  <span className={`font-medium ${selectedDate ? "text-gray-900" : "text-gray-400"}`}>
                    {selectedDate ? formatDate(selectedDate) : t("selectDate")}
                  </span>
                </button>

                {showDatePicker && (
                  <div className="mt-3 bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <span className="font-bold">
                        {currentMonth.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {dayNames.map((day) => (
                        <div key={day} className="text-xs font-semibold text-gray-400 py-1">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, i) => (
                        <div key={i} className="aspect-square">
                          {date && (
                            <button
                              onClick={() => handleDateClick(date)}
                              disabled={date < today}
                              className={`w-full h-full rounded-full text-sm font-medium transition-colors
                                ${date < today ? "text-gray-300 cursor-not-allowed" : "hover:bg-white"}
                                ${isDateSelected(date) ? "bg-black text-white hover:bg-gray-800" : ""}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("startTime")}</span>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full font-medium bg-transparent outline-none"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-1">{t("endTime")}</span>
                  <span className="font-medium text-gray-600">{endTime}</span>
                </div>
              </div>

              {/* Hours */}
              <div className="mb-4 p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase text-gray-400">{t("duration")}</span>
                  <span className="text-xs text-black font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {t("minHours", { count: minHours })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setBookingHours(Math.max(minHours, bookingHours - 1))}
                    className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                    disabled={bookingHours <= minHours}
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="font-bold text-lg">{bookingHours} {t("hoursUnit")}</span>
                  <button
                    onClick={() => setBookingHours(Math.min(12, bookingHours + 1))}
                    className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Crew */}
              <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                <span className="text-xs font-bold uppercase text-gray-400 block mb-2">{t("crewSize")}</span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCrewSize(Math.max(1, crewSize - 1))}
                    className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="font-bold text-lg">{crewSize} {crewSize === 1 ? t("person") : t("people")}</span>
                  <button
                    onClick={() => setCrewSize(Math.min(studio.max_guests || 20, crewSize + 1))}
                    className="size-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">€{pricePerHour} × {bookingHours} {t("hoursUnit")}</span>
                  <span>€{bookingHours * pricePerHour}</span>
                </div>
                {equipmentTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("equipmentTotal")}</span>
                    <span>€{equipmentTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("serviceFees")}</span>
                  <span>€{serviceFee}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>{t("total")}</span>
                  <span>€{total}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-lg"
              >
                {selectedDate ? t("reserve") : t("checkAvailability")}
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">{t("notChargedYet")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
