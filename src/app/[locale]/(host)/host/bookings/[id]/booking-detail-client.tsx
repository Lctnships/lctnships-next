"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { CancelBookingModal } from "@/components/booking/cancel-booking-modal"
import { formatCurrency as fmtCurrency, formatDate as fmtDate, formatTime as fmtTime } from "@/lib/format-locale"

interface Renter {
  id: string
  full_name: string
  avatar_url?: string
  email?: string
  phone?: string
  created_at: string
  is_verified?: boolean
}

interface Studio {
  id: string
  title: string
  location?: string
  images?: string[]
}

interface Booking {
  id: string
  booking_number?: string
  status: "pending" | "pending_approval" | "approved" | "rejected" | "expired" | "confirmed" | "completed" | "cancelled"
  payment_status?: string
  created_at: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  hourly_rate?: number
  subtotal?: number
  service_fee?: number
  total_price: number
  host_payout: number
  notes?: string
  renter: Renter | null
  studio: Studio
}

interface RenterStats {
  totalBookings: number
  avgRating: number
  cancelRate: number
  responseTime: string
}

interface BookingDetailClientProps {
  booking: Booking
  renterStats: RenterStats
}

export function BookingDetailClient({ booking, renterStats }: BookingDetailClientProps) {
  const router = useRouter()
  const t = useTranslations("HostBookingDetail")
  const locale = useLocale()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)

  const formatCurrency = (amount: number) => fmtCurrency(amount, locale)
  const formatDate = (dateString: string) => fmtDate(dateString, locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formatTime = (dateString: string) => fmtTime(dateString, locale)

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/approve`, { method: "POST" })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Approve failed" }))
        throw new Error(error)
      }
      router.push("/host/bookings")
      router.refresh()
    } catch (error) {
      console.error("Error accepting booking:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason || null }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Reject failed" }))
        throw new Error(error)
      }
      router.push("/host/bookings")
      router.refresh()
    } catch (error) {
      console.error("Error declining booking:", error)
    } finally {
      setIsProcessing(false)
      setShowDeclineModal(false)
    }
  }

  const memberSince = booking.renter?.created_at ? new Date(booking.renter.created_at).getFullYear() : new Date().getFullYear()
  const studioImage = booking.studio.images?.[0] || ""

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/host/bookings"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t("bookingRequest")}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                booking.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : booking.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {booking.status === "pending" || booking.status === "pending_approval"
                ? t("statusPending")
                : booking.status === "approved"
                ? "Approved"
                : booking.status === "rejected"
                ? "Rejected"
                : booking.status === "expired"
                ? "Expired"
                : booking.status === "confirmed"
                ? t("statusConfirmed")
                : booking.status === "completed"
                ? t("statusCompleted")
                : t("statusCancelled")}
            </span>
          </div>
          {booking.booking_number && (
            <p className="text-gray-500 text-sm mt-1">#{booking.booking_number}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Studio Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div
                className="w-full md:w-48 h-48 md:h-auto bg-cover bg-center bg-gray-200"
                style={{ backgroundImage: `url("${studioImage}")` }}
              />
              <div className="flex-1 p-6">
                <h2 className="text-xl font-bold mb-2">{booking.studio.title}</h2>
                <p className="text-gray-500 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {booking.studio.location}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t("date")}</p>
                    <p className="font-bold">{formatDate(booking.start_datetime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("time")}</p>
                    <p className="font-bold">
                      {formatTime(booking.start_datetime)} - {formatTime(booking.end_datetime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Note */}
          {booking.notes && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-black">chat</span>
                {t("guestMessage")}
              </h3>
              <p className="text-gray-700 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Guest Profile */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-black">person</span>
              {t("guestProfile")}
            </h3>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="size-20 rounded-full bg-cover bg-center bg-gray-200 border-4 border-white shadow-lg"
                    style={
                      booking.renter?.avatar_url
                        ? { backgroundImage: `url("${booking.renter?.avatar_url}")` }
                        : {}
                    }
                  >
                    {!booking.renter?.avatar_url && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-gray-400">
                          person
                        </span>
                      </div>
                    )}
                  </div>
                  {booking.renter?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white">
                      <span className="material-symbols-outlined text-xs">verified</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{booking.renter?.full_name}</h4>
                  <p className="text-sm text-gray-500">{t("memberSince", { year: memberSince })}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-black">{renterStats.totalBookings}</p>
                  <p className="text-xs text-gray-500">{t("bookings")}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-black">
                    {renterStats.avgRating > 0 ? renterStats.avgRating.toFixed(1) : "—"}
                  </p>
                  <p className="text-xs text-gray-500">{t("rating")}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-black">{renterStats.cancelRate}%</p>
                  <p className="text-xs text-gray-500">{t("cancelRate")}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-black">{renterStats.responseTime}</p>
                  <p className="text-xs text-gray-500">{t("responseTime")}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
              {booking.renter?.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  <span className="text-sm">{booking.renter?.email}</span>
                </div>
              )}
              {booking.renter?.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-symbols-outlined text-lg">phone</span>
                  <span className="text-sm">{booking.renter?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-6">{t("priceBreakdown")}</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {t("ratePerHour", {
                    rate: formatCurrency(booking.hourly_rate || 0),
                    hours: booking.total_hours,
                  })}
                </span>
                <span>{formatCurrency(booking.subtotal || booking.total_price)}</span>
              </div>
              {booking.service_fee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("serviceFee")}</span>
                  <span>{formatCurrency(booking.service_fee)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between">
                <span className="font-bold">{t("guestPays")}</span>
                <span className="font-bold">{formatCurrency(booking.total_price)}</span>
              </div>
              <div className="flex justify-between text-black">
                <span className="font-bold">{t("yourEarnings")}</span>
                <span className="font-bold text-lg">{formatCurrency(booking.host_payout)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">verified</span>
              </div>
              <div>
                <p className="font-bold text-green-800">{t("paymentSecured")}</p>
                <p className="text-sm text-green-600">{t("fundsReleased")}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {booking.status === "pending_approval" && (
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">check</span>
                {t("acceptBooking")}
              </button>
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={isProcessing}
                className="w-full py-4 bg-white border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">close</span>
                {t("declineRequest")}
              </button>
            </div>
          )}

          {booking.status === "confirmed" && (
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/host/messages?host=${booking.renter?.id}&studio=${booking.studio.id}`)}
                className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">chat</span>
                {t("messageGuest")}
              </button>
              <a
                href={`/api/calendar/ical/${booking.studio.id}`}
                download
                className="w-full py-4 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">event</span>
                {t("addToCalendar")}
              </a>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-full font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">cancel</span>
                {t("declineRequest")}
              </button>
            </div>
          )}

          {showCancelModal && (
            <CancelBookingModal
              bookingId={booking.id}
              studioTitle={booking.studio.title}
              onClose={() => setShowCancelModal(false)}
            />
          )}

          {/* Help */}
          <div className="bg-gray-50 rounded-3xl p-6">
            <h4 className="font-bold mb-2">{t("needHelp")}</h4>
            <p className="text-sm text-gray-500 mb-4">{t("helpDesc")}</p>
            <Link
              href="/help"
              className="text-black font-bold text-sm hover:underline flex items-center gap-1"
            >
              {t("support")}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{t("declineTitle")}</h3>
            <p className="text-gray-500 mb-6">{t("declineDesc")}</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder={t("declineReasonPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-black/20 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDecline}
                disabled={isProcessing || !declineReason.trim()}
                className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? t("declining") : t("declineRequest")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
