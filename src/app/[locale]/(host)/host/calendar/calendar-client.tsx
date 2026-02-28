"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"

interface CalendarBooking {
  id: string
  title: string
  type: string
  date: Date
  endDate?: Date
  color: "primary" | "blue" | "orange" | "purple"
}

interface Studio {
  id: string
  title: string
  location?: string
  image?: string
  images?: string[]
}

interface PendingPayout {
  amount: number
  nextPayoutDate: string
  progress: number
}

interface CalendarClientProps {
  bookings: CalendarBooking[]
  studio: Studio
  pendingPayout: PendingPayout
}

type ViewType = "month" | "week" | "day"

export function CalendarClient({ bookings, studio, pendingPayout }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")
  const [showNotification, setShowNotification] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const monthNames = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni",
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ]

  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i),
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      })
    }

    // Fill remaining cells
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      })
    }

    return days
  }

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingStart = new Date(booking.date)
      const bookingEnd = booking.endDate ? new Date(booking.endDate) : bookingStart
      return date >= bookingStart && date <= bookingEnd
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      editorial: "Redactionele Shoot",
      music_video: "Muziekvideo",
      commercial: "Commercieel",
      photoshoot: "Fotoshoot",
      booking: "Boeking",
    }
    return labels[type] || type
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      primary: { bg: "bg-primary/10", border: "border-primary", text: "text-primary" },
      blue: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-500" },
      orange: { bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-500" },
      purple: { bg: "bg-purple-500/10", border: "border-purple-500", text: "text-purple-500" },
    }
    return colors[color] || colors.primary
  }

  const days = getDaysInMonth(currentDate)
  const studioImage = studio.images?.[0] || studio.image

  return (
    <div className="flex gap-8">
      {/* Main Calendar Section */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              {bookings.length} geplande producties deze maand
            </p>
          </div>
          <div className="flex bg-white p-1 rounded-full border border-gray-200">
            {(["month", "week", "day"] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  viewType === view
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {{ month: "Maand", week: "Week", day: "Dag" }[view]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="size-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            Vandaag
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="size-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {dayNames.map((day) => (
              <div key={day} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7" style={{ minHeight: "600px" }}>
            {days.map((day, index) => {
              const dayBookings = getBookingsForDay(day.date)
              const today = isToday(day.date)

              return (
                <div
                  key={index}
                  className={`p-2 border-r border-b border-gray-100 flex flex-col gap-2 group hover:bg-gray-50 transition-all ${
                    !day.isCurrentMonth ? "bg-gray-50/50" : ""
                  } ${today ? "bg-primary/5" : ""}`}
                >
                  <span
                    className={`text-xs font-bold p-2 ${
                      !day.isCurrentMonth ? "text-gray-300" : ""
                    } ${
                      today
                        ? "bg-primary text-white size-6 flex items-center justify-center rounded-full"
                        : ""
                    }`}
                  >
                    {day.day}
                  </span>
                  {dayBookings.slice(0, 2).map((booking) => {
                    const colors = getColorClasses(booking.color)
                    return (
                      <div
                        key={booking.id}
                        className={`${colors.bg} border-l-4 ${colors.border} p-2 rounded-r-lg cursor-pointer hover:scale-[1.02] transition-transform`}
                      >
                        <p className={`text-[10px] font-bold uppercase tracking-tighter ${colors.text}`}>
                          {getTypeLabel(booking.type)}
                        </p>
                        <p className="text-[11px] font-bold truncate">{booking.title}</p>
                      </div>
                    )
                  })}
                  {dayBookings.length > 2 && (
                    <p className="text-[10px] text-gray-400 font-bold px-2">
                      +{dayBookings.length - 2} meer
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h4 className="text-lg font-bold mb-4">Snelle Acties</h4>
          <div className="flex flex-col gap-3">
            <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
              <span className="material-symbols-outlined">block</span>
              <span>Datums Blokkeren</span>
            </button>
            <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-all">
              <span className="material-symbols-outlined">sync</span>
              <span>Agenda Synchroniseren</span>
            </button>
            <Link
              href="/host/equipment"
              className="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Apparatuur Bijwerken</span>
            </Link>
          </div>
        </div>

        {/* Studio Image */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Studiofoto</h4>
            <Link href={`/host/studios/${studio.id}`} className="text-primary text-xs font-bold">
              Bewerken
            </Link>
          </div>
          <div className="relative group cursor-pointer overflow-hidden rounded-xl aspect-video bg-gray-100">
            {studioImage && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${studioImage}")` }}
              />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
            {studio.location && (
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {studio.location}
              </div>
            )}
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-gradient-to-br from-primary to-green-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">In Afwachting</p>
              <h4 className="text-3xl font-black">{formatCurrency(pendingPayout.amount)}</h4>
            </div>
            <span className="material-symbols-outlined text-3xl opacity-40">account_balance_wallet</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span>Volgende uitbetaling</span>
              <span className="font-bold">{pendingPayout.nextPayoutDate}</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${pendingPayout.progress}%` }} />
            </div>
          </div>
          <Link
            href="/host/earnings"
            className="w-full mt-4 text-center text-xs font-bold bg-white text-primary py-2 rounded-full block hover:bg-gray-100 transition-colors"
          >
            Bekijk Details
          </Link>
        </div>
      </aside>

      {/* New Booking Notification */}
      {showNotification && (
        <div className="fixed bottom-10 right-10 z-50 animate-bounce">
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-primary p-5 flex items-center gap-4 max-w-sm">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">celebration</span>
            </div>
            <div>
              <p className="text-sm font-bold">Nieuw Boekingsverzoek!</p>
              <p className="text-xs text-gray-500">Harper's Bazaar • 24 Okt</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-auto text-primary"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
