"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

interface Booking {
  id: string
  booking_number: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  subtotal: number
  service_fee: number
  total_amount: number
  status: string
  payment_status: string
  notes?: string | null
  created_at: string
  studio: {
    id: string
    title: string
    city?: string
    country?: string
    address?: string
    entry_code?: string
    wifi_password?: string
    access_instructions?: string
    studio_images?: { image_url: string; is_cover: boolean }[]
  }
  host?: {
    id: string
    full_name?: string
    avatar_url?: string
    bio?: string
  }
  equipment?: { name: string; included: boolean }[]
}

interface BookingDetailClientProps {
  booking: Booking
}

export function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const t = useTranslations("BookingDetail")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedWifi, setCopiedWifi] = useState(false)

  const coverImage = booking.studio.studio_images?.find((img) => img.is_cover) || booking.studio.studio_images?.[0]

  const startDate = new Date(booking.start_datetime)
  const endDate = new Date(booking.end_datetime)
  const isUpcoming = startDate > new Date()

  const formattedDate = startDate.toLocaleDateString(dateLocale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = `${startDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} — ${endDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`

  const copyToClipboard = (text: string, type: "code" | "wifi") => {
    navigator.clipboard.writeText(text)
    if (type === "code") {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedWifi(true)
      setTimeout(() => setCopiedWifi(false), 2000)
    }
  }

  const googleMapsUrl = booking.studio.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.studio.address)}`
    : "#"

  // Mock equipment if not provided
  const equipment = booking.equipment || [
    { name: "Neumann U87 Microphone", included: true },
    { name: "Avalon VT-737sp Preamp", included: true },
  ]

  // Mock pricing breakdown
  const gearPrice = 75
  const studioPrice = booking.subtotal || (booking.total_amount - booking.service_fee - gearPrice)

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/bookings"
            className="text-[#0f49bd] text-sm font-medium hover:opacity-80 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("breadcrumbMyBookings")}
          </Link>
          <span className="text-gray-400 text-sm">/</span>
          <span className="text-gray-600 text-sm">{t("breadcrumbBookingNumber")}{booking.booking_number}</span>
        </div>

        {/* Hero Section */}
        <div className="relative mb-10 group">
          <div className="w-full rounded-[32px] min-h-[450px] shadow-2xl shadow-[#0f49bd]/10 overflow-hidden relative">
            {coverImage ? (
              <Image
                src={coverImage.image_url}
                alt={booking.studio.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                {isUpcoming && (
                  <span className="bg-[#0f49bd] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {t("statusUpcoming")}
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium capitalize">
                  {booking.status === "pending" ? t("statusPending") : booking.status === "confirmed" ? t("statusConfirmed") : booking.status === "completed" ? t("statusCompleted") : booking.status === "cancelled" ? t("statusCancelled") : booking.status}
                </span>
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight mb-2">
                {booking.studio.title}
              </h1>
              {booking.host && (
                <p className="text-white/80 text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  {t("hostedBy")} {booking.host.full_name} {booking.host.bio && `• ${booking.host.bio}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e7ebf3]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#0f49bd]/10 rounded-lg text-[#0f49bd]">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{t("dateTime")}</h3>
                  <p className="text-2xl font-bold text-[#0f49bd] mb-1">{formattedDate}</p>
                  <p className="text-gray-600">{formattedTime} ({booking.total_hours} {t("hourSession")})</p>
                </div>
              </div>
            </div>

            {/* Access Instructions */}
            {isUpcoming && (booking.studio.entry_code || booking.studio.wifi_password) && (
              <div className="bg-[#0f49bd]/5 rounded-xl p-6 border-2 border-[#0f49bd]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0f49bd]">key</span>
                    <h3 className="text-lg font-bold">{t("studioAccess")}</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.studio.entry_code && (
                    <div className="bg-white p-4 rounded-lg border border-[#0f49bd]/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{t("entryCode")}</p>
                        <button
                          onClick={() => copyToClipboard(booking.studio.entry_code!, "code")}
                          className="text-[#0f49bd] text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedCode ? "check" : "content_copy"}
                          </span>
                          {copiedCode ? t("copied") : t("copy")}
                        </button>
                      </div>
                      <p className="text-3xl font-mono font-bold tracking-tighter text-[#0f49bd]">
                        {booking.studio.entry_code}
                      </p>
                    </div>
                  )}
                  {booking.studio.wifi_password && (
                    <div className="bg-white p-4 rounded-lg border border-[#0f49bd]/10">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{t("wifiPassword")}</p>
                        <button
                          onClick={() => copyToClipboard(booking.studio.wifi_password!, "wifi")}
                          className="text-[#0f49bd] text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedWifi ? "check" : "content_copy"}
                          </span>
                          {copiedWifi ? t("copied") : t("copy")}
                        </button>
                      </div>
                      <p className="text-lg font-mono font-bold text-[#0f49bd]">
                        {booking.studio.wifi_password}
                      </p>
                    </div>
                  )}
                </div>
                {booking.studio.access_instructions && (
                  <div className="mt-4 flex gap-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-sm flex-shrink-0">info</span>
                    <p>{booking.studio.access_instructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Studio Location */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e7ebf3]">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-gray-500">location_on</span>
                  <h3 className="text-lg font-bold">{t("studioLocation")}</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {booking.studio.address || `${booking.studio.city}, ${booking.studio.country}`}
                </p>
                <div className="w-full h-64 rounded-lg bg-gray-200 overflow-hidden relative">
                  {/* Map placeholder - using a static map image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-[#0f49bd] text-white p-3 rounded-full shadow-lg inline-flex mb-2">
                        <span className="material-symbols-outlined">theaters</span>
                      </div>
                      <p className="text-gray-500 text-sm">{booking.studio.city}</p>
                    </div>
                  </div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 transition-colors"
                  >
                    {t("openInGoogleMaps")}
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
              <Link
                href={`/messages?host=${booking.host?.id}`}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0d121b] text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {t("messageHost")}
              </Link>
              {isUpcoming && (
                <button className="text-gray-500 font-bold hover:text-red-500 transition-colors py-4 px-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {t("rescheduleSession")}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Summary & Pricing */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e7ebf3]">
                <h3 className="text-lg font-bold mb-6">{t("bookingSummary")}</h3>

                {/* Equipment Selection */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {t("equipmentExtras")}
                  </p>
                  <ul className="space-y-3">
                    {equipment.filter(e => e.included).map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-[#0f49bd] text-[20px]">check_circle</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      <Link href={`/studios/${booking.studio.id}`} className="hover:underline">
                        {t("addMoreEquipment")}
                      </Link>
                    </li>
                  </ul>
                </div>

                <hr className="border-[#e7ebf3] my-6" />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {t("priceOverview")}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("studioSession")} ({booking.total_hours} {t("hours")})</span>
                    <span>${studioPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("premiumEquipmentPackage")}</span>
                    <span>${gearPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("serviceFee")}</span>
                    <span>${booking.service_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-[#e7ebf3] font-bold text-lg">
                    <span>{t("totalPaid")}</span>
                    <span className="text-[#0f49bd]">${booking.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full mt-8 flex items-center justify-center gap-2 border-2 border-[#0f49bd]/20 hover:bg-[#0f49bd]/5 text-[#0f49bd] py-3 rounded-xl font-bold transition-colors">
                  <span className="material-symbols-outlined">receipt_long</span>
                  {t("downloadInvoice")}
                </button>
              </div>

              {/* Host Card Mini */}
              {booking.host && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e7ebf3] flex items-center gap-4">
                  <div className="size-12 rounded-full overflow-hidden relative flex-shrink-0">
                    {booking.host.avatar_url ? (
                      <Image
                        src={booking.host.avatar_url}
                        alt={booking.host.full_name || "Host"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("yourHost")}</p>
                    <p className="font-bold">{booking.host.full_name}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold">4.9</span>
                      <span className="text-gray-400 font-normal ml-1">(124 {t("reviews")})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#e7ebf3] py-10 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 lcntships. {t("allRightsReserved")} •{" "}
            <Link href="/terms" className="hover:underline">{t("bookingPolicy")}</Link> •{" "}
            <Link href="/help" className="hover:underline">{t("helpCenter")}</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
