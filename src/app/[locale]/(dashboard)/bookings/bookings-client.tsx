"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { RescheduleModal } from "./reschedule-modal"
import { ReviewModal } from "./review-modal"

interface Booking {
  id: string
  booking_number: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  total_amount: number
  status: string
  has_review?: boolean
  review_rating?: number
  studio: {
    id: string
    title: string
    city?: string
    address?: string
    studio_images?: { image_url: string; is_cover: boolean }[]
  }
}

interface BookingsClientProps {
  bookings: Booking[]
  favorites: any[]
  totalHours: number
}

export function BookingsClient({ bookings, favorites, totalHours }: BookingsClientProps) {
  const t = useTranslations("Bookings")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)

  const now = new Date()

  const filteredBookings = useMemo(() => {
    let filtered = bookings

    if (activeTab === "upcoming") {
      filtered = bookings.filter(
        (b) => new Date(b.start_datetime) >= now && b.status !== "cancelled"
      )
    } else if (activeTab === "past") {
      filtered = bookings.filter(
        (b) => (new Date(b.start_datetime) < now && b.status !== "cancelled") || b.status === "completed"
      )
    } else if (activeTab === "cancelled") {
      filtered = bookings.filter((b) => b.status === "cancelled")
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.studio.title.toLowerCase().includes(query) ||
          b.studio.city?.toLowerCase().includes(query) ||
          b.booking_number.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [bookings, activeTab, searchQuery, now])

  const counts = useMemo(() => {
    const upcoming = bookings.filter(
      (b) => new Date(b.start_datetime) >= now && b.status !== "cancelled"
    ).length
    const past = bookings.filter(
      (b) => (new Date(b.start_datetime) < now && b.status !== "cancelled") || b.status === "completed"
    ).length
    const cancelled = bookings.filter((b) => b.status === "cancelled").length
    return { upcoming, past, cancelled }
  }, [bookings, now])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString(dateLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const endTime = new Date(end).toLocaleTimeString(dateLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    return `${startTime} – ${endTime}`
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      completed: "bg-emerald-50 text-emerald-700",
      cancelled: "bg-red-50 text-red-600",
    }
    const labels: Record<string, string> = {
      confirmed: t("statusConfirmed"),
      pending: t("statusPending"),
      completed: t("statusCompleted"),
      cancelled: t("statusCancelled"),
    }
    return (
      <span className={`${styles[status] || styles.pending} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
        {labels[status] || status}
      </span>
    )
  }

  const tabs = [
    { key: "upcoming" as const, label: t("tabUpcoming"), count: counts.upcoming },
    { key: "past" as const, label: t("tabPast"), count: counts.past },
    { key: "cancelled" as const, label: t("tabCancelled"), count: counts.cancelled },
  ]

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 mt-0.5 sm:mt-1 font-medium text-xs sm:text-sm lg:text-base">{t("subtitle")}</p>
        </div>
        <Link
          href="/studios"
          className="bg-black hover:bg-gray-800 text-white rounded-full px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-black/10 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          {t("bookStudio")}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar */}
          <div className="mb-5 lg:mb-6">
            <div className="flex w-full sm:max-w-md items-stretch rounded-full bg-white border border-gray-200 overflow-hidden focus-within:border-gray-400 transition-colors">
              <div className="flex items-center justify-center pl-3 sm:pl-4 text-gray-400">
                <span className="material-symbols-outlined text-lg sm:text-xl">search</span>
              </div>
              <input
                className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-gray-400 px-2 sm:px-3 py-2.5 sm:py-3"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 lg:mb-6">
            <div className="flex border-b border-gray-200 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 border-b-2 pb-2.5 sm:pb-3 px-0.5 sm:px-1 text-xs sm:text-sm font-bold tracking-wide transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === tab.key ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="flex flex-col gap-4 lg:gap-5">
            {filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-12 text-center">
                <div className="flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-gray-50 mx-auto mb-3 sm:mb-4">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl text-gray-300">calendar_today</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1">{t("emptyTitle")}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {activeTab === "upcoming"
                    ? t("emptyUpcoming")
                    : activeTab === "past"
                    ? t("emptyPast")
                    : t("emptyCancelled")}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/studios"
                    className="inline-flex items-center gap-2 mt-4 sm:mt-6 bg-black text-white rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">search</span>
                    {t("browseStudios")}
                  </Link>
                )}
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isPast={activeTab === "past"}
                  onReschedule={() => setRescheduleBooking(booking)}
                  onReview={() => setReviewBooking(booking)}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex w-72 flex-col gap-6 shrink-0">
          {/* Stats Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
            <div className="flex items-center justify-center size-14 bg-gray-50 rounded-2xl mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-gray-500">timer</span>
            </div>
            <h3 className="text-3xl font-extrabold">{totalHours}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t("totalHoursBooked")}</p>
          </div>

          {/* Favorites Card */}
          {favorites.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base">{t("favoriteStudios")}</h3>
                <Link href="/favorites" className="text-black text-xs font-bold hover:underline">{t("viewAll")}</Link>
              </div>
              <div className="flex flex-col gap-4">
                {favorites.map((fav, index) => {
                  const coverImage = fav.studio.studio_images?.find((img: any) => img.is_cover) || fav.studio.studio_images?.[0]
                  return (
                    <Link
                      key={index}
                      href={`/studios/${fav.studio.id}`}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="size-11 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {coverImage ? (
                          <Image
                            src={coverImage.image_url}
                            alt={fav.studio.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-black transition-colors">
                          {fav.studio.title}
                        </p>
                        <p className="text-xs text-gray-400">{fav.studio.city}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="rounded-2xl bg-black p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-1">{t("needHelp")}</h4>
              <p className="text-white/60 text-xs mb-4">{t("supportDescription")}</p>
              <Link
                href="/help"
                className="w-full py-2.5 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors block text-center"
              >
                {t("contactSupport")}
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">support_agent</span>
            </div>
          </div>
        </aside>
      </div>

      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
        />
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  )
}

interface BookingCardProps {
  booking: Booking
  isPast: boolean
  onReschedule: () => void
  onReview: () => void
  formatDate: (date: string) => string
  formatTime: (start: string, end: string) => string
  getStatusBadge: (status: string) => React.ReactNode
}

function BookingCard({
  booking,
  isPast,
  onReschedule,
  onReview,
  formatDate,
  formatTime,
  getStatusBadge,
}: BookingCardProps) {
  const t = useTranslations("Bookings")
  const coverImage = booking.studio.studio_images?.find((img) => img.is_cover) || booking.studio.studio_images?.[0]

  return (
    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white overflow-hidden group hover:border-gray-200 transition-colors">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5">
        {/* Image */}
        <div className="w-full sm:w-44 lg:w-56 h-36 sm:h-32 lg:h-40 rounded-lg sm:rounded-xl overflow-hidden shrink-0 relative">
          {coverImage ? (
            <Image
              src={coverImage.image_url}
              alt={booking.studio.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 176px, 224px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-3xl sm:text-4xl">image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Title and Status */}
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold truncate">{booking.studio.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{booking.studio.city}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            {/* Date and Time */}
            <div className="flex flex-wrap gap-3 sm:gap-5 mt-3 sm:mt-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg sm:rounded-xl bg-gray-50">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px] text-gray-500">calendar_today</span>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t("date")}</p>
                  <p className="text-xs sm:text-sm font-semibold">{formatDate(booking.start_datetime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg sm:rounded-xl bg-gray-50">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px] text-gray-500">schedule</span>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t("time")}</p>
                  <p className="text-xs sm:text-sm font-semibold">{formatTime(booking.start_datetime, booking.end_datetime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-5">
            {isPast ? (
              <>
                {!booking.has_review ? (
                  <button
                    onClick={onReview}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-black text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg">rate_review</span>
                    {t("writeReview")}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                    <span className="material-symbols-outlined text-base sm:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-xs sm:text-sm">{booking.review_rating || 5}.0</span>
                    <span className="text-[9px] sm:text-[10px] font-bold ml-0.5 opacity-70 uppercase tracking-wider">{t("reviewed")}</span>
                  </div>
                )}
                <Link
                  href={`/book/${booking.studio.id}/session`}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg text-gray-500">refresh</span>
                  {t("rebookStudio")}
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={onReschedule}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t("reschedule")}
                </button>
                <Link
                  href={`/messages?booking=${booking.id}`}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t("messageHost")}
                </Link>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gray-50 text-xs sm:text-sm font-semibold hover:bg-black hover:text-white transition-all"
                >
                  {t("viewDetails")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
