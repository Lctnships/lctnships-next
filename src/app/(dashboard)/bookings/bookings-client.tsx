"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
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
  payment_status?: string
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

interface Favorite {
  studio: {
    id: string
    title: string
    city?: string
    studio_images?: { image_url: string; is_cover: boolean }[]
  }
}

interface BookingsClientProps {
  bookings: Booking[]
  favorites: Favorite[]
  totalHours: number
}

export function BookingsClient({ bookings, favorites, totalHours }: BookingsClientProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)

  const now = new Date()

  const filteredBookings = useMemo(() => {
    let filtered = bookings

    // Filter by tab
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

    // Filter by search
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const endTime = new Date(end).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    return `${startTime} - ${endTime}`
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    }
    const labels: Record<string, string> = {
      confirmed: "Confirmed",
      pending: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled",
    }
    return (
      <div className={`${styles[status] || styles.pending} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
        {labels[status] || status}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Page Header */}
      <div className="max-w-[1440px] mx-auto px-10 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0d121b]">My Bookings</h1>
            <p className="text-[#4c669a] mt-1 font-medium">Manage and track your studio sessions</p>
          </div>
          <Link
            href="/studios"
            className="bg-[#2b6cee] hover:bg-[#2b6cee]/90 text-white rounded-full px-8 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#2b6cee]/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Book a Studio
          </Link>
        </div>

        <div className="flex gap-10">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="flex w-full max-w-md items-stretch rounded-full bg-white border border-[#e7ebf3] overflow-hidden">
                <div className="flex items-center justify-center pl-4 text-[#4c669a]">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input
                  className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#4c669a] px-3 py-3"
                  placeholder="Search bookings"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex border-b border-[#cfd7e7] gap-12">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`flex items-center gap-2 border-b-[3px] pb-4 px-2 font-bold text-sm tracking-wide transition-colors ${
                    activeTab === "upcoming"
                      ? "border-[#2b6cee] text-[#2b6cee]"
                      : "border-transparent text-[#4c669a] hover:text-[#2b6cee]"
                  }`}
                >
                  Upcoming
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "upcoming" ? "bg-[#2b6cee]/10 text-[#2b6cee]" : "bg-gray-100 text-gray-500"
                  }`}>
                    {counts.upcoming}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`flex items-center gap-2 border-b-[3px] pb-4 px-2 font-bold text-sm tracking-wide transition-colors ${
                    activeTab === "past"
                      ? "border-[#2b6cee] text-[#2b6cee]"
                      : "border-transparent text-[#4c669a] hover:text-[#2b6cee]"
                  }`}
                >
                  Past
                </button>
                <button
                  onClick={() => setActiveTab("cancelled")}
                  className={`flex items-center gap-2 border-b-[3px] pb-4 px-2 font-bold text-sm tracking-wide transition-colors ${
                    activeTab === "cancelled"
                      ? "border-[#2b6cee] text-[#2b6cee]"
                      : "border-transparent text-[#4c669a] hover:text-[#2b6cee]"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="flex flex-col gap-6">
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e7ebf3] p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">calendar_today</span>
                  <h3 className="text-lg font-bold text-[#0d121b] mb-2">No bookings found</h3>
                  <p className="text-[#4c669a]">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming bookings"
                      : activeTab === "past"
                      ? "Your past bookings will appear here"
                      : "You don't have any cancelled bookings"}
                  </p>
                  {activeTab === "upcoming" && (
                    <Link
                      href="/studios"
                      className="inline-flex items-center gap-2 mt-6 bg-[#2b6cee] text-white rounded-full px-6 py-3 text-sm font-bold"
                    >
                      <span className="material-symbols-outlined">search</span>
                      Browse Studios
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

          {/* Sidebar */}
          <aside className="w-80 flex flex-col gap-8">
            {/* Stats Card */}
            <div className="bg-white rounded-xl p-8 border border-[#e7ebf3] shadow-sm text-center">
              <div className="inline-flex items-center justify-center size-16 bg-[#2b6cee]/10 rounded-full mb-4">
                <span className="material-symbols-outlined text-[#2b6cee] text-3xl">timer</span>
              </div>
              <h3 className="text-3xl font-extrabold text-[#0d121b]">{totalHours}</h3>
              <p className="text-[#4c669a] text-sm font-bold uppercase tracking-wider mb-2">Total Hours Booked</p>
              <div className="h-1.5 w-full bg-[#f0f2f5] rounded-full overflow-hidden mt-4">
                <div className="h-full bg-[#2b6cee]" style={{ width: `${Math.min((totalHours / 200) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-[#4c669a] mt-2">{Math.round((totalHours / 200) * 100)}% of your annual creative goal</p>
            </div>

            {/* Favorites Card */}
            <div className="bg-white rounded-xl p-6 border border-[#e7ebf3] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Favorite Studios</h3>
                <Link href="/favorites" className="text-[#2b6cee] text-xs font-bold hover:underline">View All</Link>
              </div>
              <div className="flex flex-col gap-5">
                {favorites.map((fav, index) => {
                  const coverImage = fav.studio.studio_images?.find((img) => img.is_cover) || fav.studio.studio_images?.[0]
                  return (
                    <Link
                      key={index}
                      href={`/studios/${fav.studio.id}`}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {coverImage ? (
                          <Image
                            src={coverImage.image_url}
                            alt={fav.studio.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-[#2b6cee] transition-colors">
                          {fav.studio.title}
                        </p>
                        <p className="text-xs text-[#4c669a]">{fav.studio.city}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Link
                href="/favorites"
                className="mt-6 w-full py-2.5 rounded-full border border-dashed border-[#cfd7e7] text-[#4c669a] text-xs font-bold hover:border-[#2b6cee] hover:text-[#2b6cee] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-sm">favorite</span>
                Manage Favorites
              </Link>
            </div>

            {/* Support Card */}
            <div className="bg-[#2b6cee] rounded-xl p-6 text-white shadow-xl shadow-[#2b6cee]/20 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-1">Need help?</h4>
                <p className="text-white/80 text-xs mb-4">Our support team is available 24/7 for booking inquiries.</p>
                <Link
                  href="/help"
                  className="w-full py-2 bg-white text-[#2b6cee] rounded-full text-xs font-bold hover:bg-white/90 transition-colors block text-center"
                >
                  Contact Support
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">support_agent</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  )
}

function PayNowButton({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        console.error("Could not start payment:", data.error)
        setIsLoading(false)
        return
      }
      window.location.href = data.url
    } catch (error) {
      console.error("Could not start payment:", error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={isLoading}
      className="px-5 py-2.5 rounded-full bg-[#2b6cee] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#2b6cee]/20 hover:bg-[#2b6cee]/90 transition-colors disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-lg">credit_card</span>
      {isLoading ? "Loading..." : "Pay Now"}
    </button>
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
  const coverImage = booking.studio.studio_images?.find((img) => img.is_cover) || booking.studio.studio_images?.[0]

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden group">
      <div className="flex gap-6 p-6">
        <div className="w-64 h-44 rounded-xl overflow-hidden shrink-0 relative">
          {coverImage ? (
            <Image
              src={coverImage.image_url}
              alt={booking.studio.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-[#0d121b]">{booking.studio.title}</h3>
                <p className="text-[#4c669a] text-sm mt-1">{booking.studio.city}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#f0f2f5] p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[#2b6cee]">calendar_today</span>
                </div>
                <div>
                  <p className="text-xs text-[#4c669a] uppercase font-bold tracking-tighter">Date</p>
                  <p className="text-sm font-bold">{formatDate(booking.start_datetime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#f0f2f5] p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[#2b6cee]">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-[#4c669a] uppercase font-bold tracking-tighter">Time</p>
                  <p className="text-sm font-bold">{formatTime(booking.start_datetime, booking.end_datetime)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-3">
              {isPast ? (
                <>
                  {!booking.has_review ? (
                    <button
                      onClick={onReview}
                      className="px-5 py-2.5 rounded-full bg-[#2b6cee] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#2b6cee]/20 hover:bg-[#2b6cee]/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">rate_review</span>
                      Leave a Review
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 bg-yellow-50 text-yellow-700 px-6 py-2.5 rounded-full">
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-black text-lg leading-none">{booking.review_rating || 5}.0</span>
                      <span className="text-xs font-bold ml-1 opacity-70">Reviewed</span>
                    </div>
                  )}
                  <Link
                    href={`/book/${booking.studio.id}/session`}
                    className="px-5 py-2.5 rounded-full border border-[#e7ebf3] text-sm font-bold hover:bg-[#f6f6f8] transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[#2b6cee] text-lg">refresh</span>
                    Rebook
                  </Link>
                </>
              ) : (
                <>
                  {booking.status === "confirmed" && booking.payment_status !== "paid" && (
                    <PayNowButton bookingId={booking.id} />
                  )}
                  <button
                    onClick={onReschedule}
                    className="px-5 py-2.5 rounded-full border border-[#e7ebf3] text-sm font-bold hover:bg-[#f6f6f8] transition-colors"
                  >
                    Reschedule
                  </button>
                  <Link
                    href={`/messages?booking=${booking.id}`}
                    className="px-5 py-2.5 rounded-full border border-[#e7ebf3] text-sm font-bold hover:bg-[#f6f6f8] transition-colors"
                  >
                    Message Host
                  </Link>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#f0f2f5] text-sm font-bold hover:bg-[#2b6cee] hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                </>
              )}
            </div>
            <button className="p-2.5 rounded-full border border-[#e7ebf3] hover:bg-[#f6f6f8] transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
