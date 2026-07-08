"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"
import { formatCurrency as fmtCurrency, formatDate as fmtDate } from "@/lib/format-locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
  wix_calendar_url?: string | null
  meetingpackage_calendar_url?: string | null
  ical_token?: string | null
}

interface PendingPayout {
  amount: number
  nextPayoutDate: string
  progress: number
}

interface BlockedDate {
  id: string
  studio_id: string
  blocked_date: string
  reason?: string
}

interface CalendarClientProps {
  bookings: CalendarBooking[]
  studio: Studio
  pendingPayout: PendingPayout
}

type ViewType = "month" | "week" | "day"

export function CalendarClient({ bookings, studio, pendingPayout }: CalendarClientProps) {
  const t = useTranslations("HostCalendar")
  const locale = useLocale()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")

  // Block dates state
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [blockStartDate, setBlockStartDate] = useState("")
  const [blockEndDate, setBlockEndDate] = useState("")
  const [blockReason, setBlockReason] = useState("")
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isBlocking, setIsBlocking] = useState(false)

  // Sync dialog state
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  // External calendar state
  const [externalCalendarUrl, setExternalCalendarUrl] = useState("")
  const [externalCalendarConnected, setExternalCalendarConnected] = useState(false)
  const [externalCalendarLoading, setExternalCalendarLoading] = useState(false)
  const [selectedExternalProvider, setSelectedExternalProvider] = useState<"wix" | "meetingpackage">("wix")

  const icalUrl = typeof window !== "undefined" && studio.ical_token
    ? `${window.location.origin}/api/calendar/ical/${studio.id}?token=${studio.ical_token}`
    : ""

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await fetch(`/api/studios/blocked-dates?studio_id=${studio.id}`)
      if (res.ok) {
        const data = await res.json()
        setBlockedDates(data.blockedDates || [])
      }
    } catch (err) {
      console.error("Failed to fetch blocked dates:", err)
    }
  }, [studio.id])

  // Fetch blocked dates on mount
  useEffect(() => {
    fetchBlockedDates()
  }, [fetchBlockedDates])

  // Initialize external calendar connection state from studio prop
  useEffect(() => {
    setExternalCalendarConnected(!!studio.wix_calendar_url || !!studio.meetingpackage_calendar_url)
  }, [studio.wix_calendar_url, studio.meetingpackage_calendar_url])

  const handleBlockDates = async () => {
    if (!blockStartDate) return
    setIsBlocking(true)
    try {
      const res = await fetch("/api/studios/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio_id: studio.id,
          start_date: blockStartDate,
          end_date: blockEndDate || blockStartDate,
          reason: blockReason || undefined,
        }),
      })
      if (res.ok) {
        await fetchBlockedDates()
        setShowBlockDialog(false)
        setBlockStartDate("")
        setBlockEndDate("")
        setBlockReason("")
      }
    } catch (err) {
      console.error("Failed to block dates:", err)
    } finally {
      setIsBlocking(false)
    }
  }

  const handleRemoveBlock = async (id: string) => {
    try {
      await fetch(`/api/studios/blocked-dates?id=${id}`, { method: "DELETE" })
      await fetchBlockedDates()
    } catch (err) {
      console.error("Failed to remove blocked date:", err)
    }
  }

  const handleCopyIcal = async () => {
    try {
      await navigator.clipboard.writeText(icalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return blockedDates.some((bd) => bd.blocked_date === dateStr)
  }

  const formatCurrency = (amount: number) => fmtCurrency(amount, locale)

  const monthNames = [
    t("monthJanuary"), t("monthFebruary"), t("monthMarch"), t("monthApril"),
    t("monthMay"), t("monthJune"), t("monthJuly"), t("monthAugust"),
    t("monthSeptember"), t("monthOctober"), t("monthNovember"), t("monthDecember"),
  ]

  const dayNames = [
    t("daySun"), t("dayMon"), t("dayTue"), t("dayWed"),
    t("dayThu"), t("dayFri"), t("daySat"),
  ]

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
      editorial: t("editorial"),
      music_video: t("musicVideo"),
      commercial: t("commercial"),
      photoshoot: t("photoshoot"),
      booking: t("booking"),
    }
    return labels[type] || type
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      primary: { bg: "bg-black/10", border: "border-black", text: "text-black" },
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
              {t("scheduledProductions", { count: bookings.length })}
            </p>
          </div>
          <div className="flex bg-white p-1 rounded-full border border-gray-200">
            {(["month", "week", "day"] as ViewType[]).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  viewType === view
                    ? "bg-black text-white shadow-lg shadow-black/20"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {{ month: t("monthView"), week: t("weekView"), day: t("dayView") }[view]}
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
            className="px-4 py-2 text-sm font-bold text-black hover:bg-black/10 rounded-full transition-colors"
          >
            {t("today")}
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
              const blocked = isDateBlocked(day.date)

              return (
                <div
                  key={index}
                  className={`p-2 border-r border-b border-gray-100 flex flex-col gap-2 group hover:bg-gray-50 transition-all ${
                    !day.isCurrentMonth ? "bg-gray-50/50" : ""
                  } ${today ? "bg-black/5" : ""} ${blocked ? "bg-red-50" : ""}`}
                >
                  <span
                    className={`text-xs font-bold p-2 ${
                      !day.isCurrentMonth ? "text-gray-300" : ""
                    } ${
                      today
                        ? "bg-black text-white size-6 flex items-center justify-center rounded-full"
                        : ""
                    }`}
                  >
                    {day.day}
                  </span>
                  {blocked && (
                    <div className="bg-red-100 border-l-4 border-red-400 p-1.5 rounded-r-lg">
                      <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">block</span>
                        {t("blockedDayLabel")}
                      </p>
                    </div>
                  )}
                  {dayBookings.slice(0, blocked ? 1 : 2).map((booking) => {
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
                  {dayBookings.length > (blocked ? 1 : 2) && (
                    <p className="text-[10px] text-gray-400 font-bold px-2">
                      {t("moreEvents", { count: dayBookings.length - (blocked ? 1 : 2) })}
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
          <h4 className="text-lg font-bold mb-4">{t("quickActions")}</h4>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowBlockDialog(true)}
              className="flex items-center gap-3 w-full p-4 rounded-xl bg-black text-white font-bold hover:shadow-lg hover:shadow-black/20 transition-all"
            >
              <span className="material-symbols-outlined">block</span>
              <span>{t("blockDates")}</span>
            </button>
            <button
              onClick={() => setShowSyncDialog(true)}
              className="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined">sync</span>
              <span>{t("syncCalendar")}</span>
            </button>
            <Link
              href="/host/equipment"
              className="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-all"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span>{t("updateEquipment")}</span>
            </Link>
          </div>
        </div>

        {/* Blocked Dates Summary */}
        {blockedDates.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-bold mb-4">{t("blockedDatesHeader")}</h4>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {blockedDates.slice(0, 5).map((bd) => (
                <div key={bd.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-sm">block</span>
                    <span>{fmtDate(bd.blocked_date, locale, { day: "numeric", month: "short" })}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlock(bd.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {blockedDates.length > 5 && (
                <p className="text-xs text-gray-400">{t("moreEvents", { count: blockedDates.length - 5 })}</p>
              )}
            </div>
          </div>
        )}

        {/* Studio Image */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">{t("studioPhoto")}</h4>
            <Link href={`/host/studios/${studio.id}`} className="text-black text-xs font-bold">
              {t("edit")}
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
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl p-6 text-white shadow-xl shadow-black/10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{t("pendingLabel")}</p>
              <h4 className="text-3xl font-black">{formatCurrency(pendingPayout.amount)}</h4>
            </div>
            <span className="material-symbols-outlined text-3xl opacity-40">account_balance_wallet</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span>{t("nextPayout")}</span>
              <span className="font-bold">{pendingPayout.nextPayoutDate}</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${pendingPayout.progress}%` }} />
            </div>
          </div>
          <Link
            href="/host/earnings"
            className="w-full mt-4 text-center text-xs font-bold bg-white text-black py-2 rounded-full block hover:bg-gray-100 transition-colors"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </aside>

      {/* New Booking Notification */}
      {/* Block Dates Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("blockDates")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">{t("blockDatesSubtitle")}</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold">{t("blockStartDate")}</label>
                <input
                  type="date"
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold">{t("blockEndDate")}</label>
                <input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  min={blockStartDate}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold">{t("blockReason")}</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={t("blockReasonPlaceholder")}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowBlockDialog(false)}
              className="px-6 py-2.5 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleBlockDates}
              disabled={!blockStartDate || isBlocking}
              className="px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {isBlocking ? t("blocking") : t("block")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Calendar Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("syncCalendar")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-6">{t("syncDialogSubtitle")}</p>
          <div className="space-y-4">
            {/* iCal Export */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-black">calendar_month</span>
                <div>
                  <p className="font-bold text-sm">{t("icalTitle")}</p>
                  <p className="text-xs text-gray-500">{t("icalDesc")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={icalUrl}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white truncate"
                />
                <button
                  onClick={handleCopyIcal}
                  className="px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-black/90 transition-colors whitespace-nowrap"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>

            {/* Google Calendar */}
            <a
              href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.5 18.5h3V10.5h-3v8zm-1.5-9h3c1.105 0 2 .895 2 2v5h-3v-1.5h-1.5v-1.5h.5V10.5zm4.5 4.5h1.5v1.5h-1.5V14z" fill="#4285F4"/>
              </svg>
              <div>
                <p className="font-bold text-sm">{t("googleCalendarTitle")}</p>
                <p className="text-xs text-gray-500">{t("googleCalendarDesc")}</p>
              </div>
            </a>

            {/* Wix Calendar Import */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#000" strokeWidth="1.5"/>
                  <path d="M7 8h4M7 12h10M7 16h6" stroke="#000" strokeWidth="1.5"/>
                </svg>
                <div>
                  <p className="font-bold text-sm">{selectedExternalProvider === "wix" ? t("wixCalendarTitle") : t("meetingpackageCalendarTitle")}</p>
                  <p className="text-xs text-gray-500">{selectedExternalProvider === "wix" ? t("wixCalendarDesc") : t("meetingpackageCalendarDesc")}</p>
                </div>
              </div>
              
              {/* Provider selector */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSelectedExternalProvider("wix")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedExternalProvider === "wix" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Wix
                </button>
                <button
                  onClick={() => setSelectedExternalProvider("meetingpackage")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedExternalProvider === "meetingpackage" 
                      ? "bg-black text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  MeetingPackage
                </button>
              </div>

              {externalCalendarConnected ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <span className="text-sm font-medium text-green-700">
                      {selectedExternalProvider === "wix" ? t("wixConnected") : t("meetingpackageConnected")}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/calendar/import/${studio.id}`, { method: "DELETE" })
                      if (res.ok) setExternalCalendarConnected(false)
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    {selectedExternalProvider === "wix" ? t("disconnectWix") : t("disconnectMeetingpackage")}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={externalCalendarUrl}
                    onChange={(e) => setExternalCalendarUrl(e.target.value)}
                    placeholder={selectedExternalProvider === "wix" ? t("wixCalendarUrlPlaceholder") : t("meetingpackageCalendarUrlPlaceholder")}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <p className="text-xs text-gray-500">
                    {selectedExternalProvider === "wix" ? t("wixCalendarInstructions") : t("meetingpackageCalendarInstructions")}
                  </p>
                  <button
                    onClick={async () => {
                      if (!externalCalendarUrl) return
                      setExternalCalendarLoading(true)
                      try {
                        const res = await fetch(`/api/calendar/import/${studio.id}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ 
                            ical_url: externalCalendarUrl,
                            provider: selectedExternalProvider
                          })
                        })
                        if (res.ok) {
                          setExternalCalendarConnected(true)
                          setExternalCalendarUrl("")
                        }
                      } catch (err) {
                        console.error("Failed to connect calendar:", err)
                      } finally {
                        setExternalCalendarLoading(false)
                      }
                    }}
                    disabled={!externalCalendarUrl || externalCalendarLoading}
                    className="w-full px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-black/90 transition-colors disabled:opacity-50"
                  >
                    {externalCalendarLoading ? "..." : (selectedExternalProvider === "wix" ? t("connectWixCalendar") : t("connectMeetingpackageCalendar"))}
                  </button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowSyncDialog(false)}
              className="px-6 py-2.5 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              {t("close")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
