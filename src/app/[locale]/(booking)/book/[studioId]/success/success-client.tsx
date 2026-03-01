"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"

interface Studio {
  id: string
  title: string
  city?: string
  address?: string
  studio_images?: { image_url: string; is_cover: boolean }[]
}

interface Booking {
  id: string
  booking_number: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  total_amount: number
  status: string
}

interface SuccessClientProps {
  studio: Studio
  booking: Booking
}

export function SuccessClient({ studio, booking }: SuccessClientProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]

  const startDate = new Date(booking.start_datetime)
  const endDate = new Date(booking.end_datetime)

  const formattedDate = startDate.toLocaleDateString("nl-NL", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = `${startDate.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${endDate.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`

  // Generate calendar event details
  const eventTitle = encodeURIComponent(`Studio Booking: ${studio.title}`)
  const eventDetails = encodeURIComponent(`Booking #${booking.booking_number}\n\n${studio.address || studio.city || ""}`)
  const eventLocation = encodeURIComponent(studio.address || studio.city || "")
  const startISO = startDate.toISOString().replace(/-|:|\.\d{3}/g, "")
  const endISO = endDate.toISOString().replace(/-|:|\.\d{3}/g, "")

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startISO}/${endISO}&details=${eventDetails}&location=${eventLocation}`
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${eventDetails}&location=${eventLocation}`

  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//lctnships//EN
BEGIN:VEVENT
UID:${booking.id}@lctnships.com
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d{3}/g, "")}
DTSTART:${startISO}
DTEND:${endISO}
SUMMARY:Studio Booking: ${studio.title}
DESCRIPTION:Booking #${booking.booking_number}
LOCATION:${studio.address || studio.city || ""}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `booking-${booking.booking_number}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header - All Complete */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
                <span className="text-sm text-gray-500">Details</span>
              </div>
              <div className="w-8 h-px bg-green-500"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
                <span className="text-sm text-gray-500">Betaling</span>
              </div>
              <div className="w-8 h-px bg-green-500"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
                <span className="text-sm font-medium">Bevestigd</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Boeking Bevestigd!</h1>
          <p className="text-gray-500">
            Je studiosessie is succesvol geboekt. Een bevestigingsmail is naar je inbox verzonden.
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-[2rem] p-8 mb-8">
          {/* Studio Info */}
          <div className="flex gap-4 pb-6 border-b border-gray-100">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              {coverImage ? (
                <Image
                  src={coverImage.image_url}
                  alt={studio.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">image</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{studio.title}</h2>
              <div className="flex items-center text-gray-500 mt-1">
                <span className="material-symbols-outlined text-base mr-1">location_on</span>
                {studio.address || studio.city || "Amsterdam"}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600">confirmation_number</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Boekingsreferentie</div>
                <div className="font-semibold">{booking.booking_number}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600">calendar_today</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Datum & Tijd</div>
                <div className="font-semibold">{formattedDate}</div>
                <div className="text-gray-600">{formattedTime} ({booking.total_hours}h)</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600">euro</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Totaal Betaald</div>
                <div className="font-semibold">€{booking.total_amount}</div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {booking.status === "confirmed" ? "Bevestigd" : "In Afwachting"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">calendar_add_on</span>
            Toevoegen aan Agenda
          </button>

          <Link
            href="/bookings"
            className="w-full bg-white border-2 border-gray-200 py-4 rounded-full font-semibold hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">list_alt</span>
            Mijn Boekingen Bekijken
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Vragen over je boeking?{" "}
          <Link href="/help" className="text-black underline">Neem contact op</Link>
        </p>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Toevoegen aan Agenda</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Google Calendar</div>
                  <div className="text-sm text-gray-500">Toevoegen aan je Google-account</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 ml-auto">chevron_right</span>
              </a>

              <button
                onClick={generateICS}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-gray-700">smartphone</span>
                </div>
                <div>
                  <div className="font-medium">Apple Calendar</div>
                  <div className="text-sm text-gray-500">.ics bestand downloaden</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 ml-auto">chevron_right</span>
              </button>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#0078D4" d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V12h4.67l-.89 4.44h4.65L13.67 12H24zm0-2.28q0 .29-.21.49-.21.21-.51.21H7.33l3.4-4.8h10.46q.54 0 .88.35.33.35.33.87v.87z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Outlook</div>
                  <div className="text-sm text-gray-500">Toevoegen aan Outlook-agenda</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 ml-auto">chevron_right</span>
              </a>

              <button
                onClick={generateICS}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-gray-700">download</span>
                </div>
                <div>
                  <div className="font-medium">Download .ics</div>
                  <div className="text-sm text-gray-500">Voor andere agenda-apps</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 ml-auto">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
