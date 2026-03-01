"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

interface Booking {
  id: string
  booking_number: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  studio: {
    id: string
    title: string
    city?: string
    address?: string
    studio_images?: { image_url: string; is_cover: boolean }[]
  }
}

interface RescheduleModalProps {
  booking: Booking
  onClose: () => void
  onSuccess?: () => void
}

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
]

export function RescheduleModal({ booking, onClose, onSuccess }: RescheduleModalProps) {
  const t = useTranslations("Reschedule")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverImage = booking.studio.studio_images?.find((img) => img.is_cover) || booking.studio.studio_images?.[0]

  const originalDate = new Date(booking.start_datetime)
  const originalTime = originalDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const originalEndTime = new Date(booking.end_datetime).toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: { day: number; disabled: boolean }[] = []

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, disabled: true })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const disabled = date < today
      days.push({ day, disabled })
    }

    return days
  }, [currentMonth])

  const monthYear = currentMonth.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })

  const navigateMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1))
    setSelectedDate(null)
  }

  const getNewDateString = () => {
    if (!selectedDate) return ""
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
    return newDate.toLocaleDateString(dateLocale, { month: "short", day: "numeric" })
  }

  const handleConfirm = async () => {
    if (!selectedDate) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Parse selected time (e.g., "10:00 AM" -> hours)
      const [timePart, ampm] = selectedTime.split(" ")
      const [hours, minutes] = timePart.split(":").map(Number)
      let hour24 = hours
      if (ampm === "PM" && hours !== 12) hour24 += 12
      if (ampm === "AM" && hours === 12) hour24 = 0

      // Create new start datetime
      const newStartDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        selectedDate,
        hour24,
        minutes
      )

      // Calculate new end datetime based on original duration
      const newEndDate = new Date(newStartDate.getTime() + booking.total_hours * 60 * 60 * 1000)

      const response = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_start_datetime: newStartDate.toISOString(),
          new_end_datetime: newEndDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("errorFailed"))
      }

      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Unavailable times (mock)
  const unavailableTimes = ["02:00 PM"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/40 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[1024px] shadow-2xl rounded-[40px] flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-8 pb-4">
          <h1 className="text-black tracking-tight text-[28px] md:text-[32px] font-bold leading-tight min-w-72">
            {t("title")} {booking.studio.title}
          </h1>
          <button
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-8 gap-8">
          {/* Left Column: Current Booking Card */}
          <div className="flex flex-col gap-4 w-full md:w-[320px]">
            <h3 className="text-black text-lg font-bold leading-tight tracking-[-0.015em] px-1">{t("currentBooking")}</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-black text-sm font-semibold uppercase tracking-wider">
                  {originalTime} - {originalEndTime}
                </p>
                <p className="text-black text-xl font-bold leading-tight">
                  {booking.total_hours} {t("hourSession")}
                </p>
                <p className="text-gray-500 text-sm font-medium">
                  {originalDate.toLocaleDateString(dateLocale, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="w-full h-40 rounded-lg overflow-hidden relative">
                {coverImage ? (
                  <Image
                    src={coverImage.image_url}
                    alt={booking.studio.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-xs">{booking.studio.address || booking.studio.city}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 px-1 italic">
              {t("freeRescheduleNote")}
            </p>
          </div>

          {/* Right Column: Interactive Selection */}
          <div className="flex flex-col flex-1 gap-6 overflow-y-auto pr-2">
            {/* Calendar Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-black text-lg font-bold leading-tight tracking-[-0.015em] px-1">{t("selectNewDate")}</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center p-1 justify-between mb-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-700">chevron_left</span>
                  </button>
                  <p className="text-black text-base font-bold leading-tight flex-1 text-center">{monthYear}</p>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-700">chevron_right</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[t("daySun"), t("dayMon"), t("dayTue"), t("dayWed"), t("dayThu"), t("dayFri"), t("daySat")].map((day) => (
                    <p key={day} className="text-gray-400 text-[11px] font-bold uppercase flex h-10 w-full items-center justify-center">
                      {day}
                    </p>
                  ))}
                  {calendarDays.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => !item.disabled && item.day > 0 && setSelectedDate(item.day)}
                      disabled={item.disabled || item.day === 0}
                      className={`h-10 w-full text-sm font-medium flex items-center justify-center transition-all ${
                        item.day === 0
                          ? ""
                          : item.disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : selectedDate === item.day
                          ? ""
                          : "text-black hover:bg-gray-200 rounded-full"
                      }`}
                    >
                      {item.day > 0 && (
                        selectedDate === item.day ? (
                          <div className="flex size-9 items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/20 font-bold">
                            {item.day}
                          </div>
                        ) : (
                          item.day
                        )
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black text-lg font-bold leading-tight tracking-[-0.015em] px-1">{t("availableTimes")}</h3>
                {selectedDate && (
                  <span className="text-xs text-black font-bold">{getNewDateString()}</span>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                {TIME_SLOTS.map((time) => {
                  const isUnavailable = unavailableTimes.includes(time)
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      onClick={() => !isUnavailable && setSelectedTime(time)}
                      disabled={isUnavailable}
                      className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 transition-all ${
                        isUnavailable
                          ? "border-2 border-transparent bg-gray-100 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-2 border-black bg-black/10"
                          : "border-2 border-transparent bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <p className={`text-sm font-bold leading-normal ${
                        isUnavailable
                          ? "text-gray-400 line-through"
                          : isSelected
                          ? "text-black"
                          : "text-black"
                      }`}>
                        {time}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {error ? (
              <>
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm text-red-500">{error}</p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-black">info</span>
                <p className="text-sm text-gray-500">
                  {t("changingTo")}{" "}
                  <span className="font-bold text-black">
                    {getNewDateString()}, {selectedTime}
                  </span>
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 h-14 text-sm font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || isSubmitting}
              className={`flex-1 md:flex-none min-w-[200px] px-8 h-14 items-center justify-center rounded-full text-base font-bold shadow-xl transition-all flex gap-2 ${
                selectedDate && !isSubmitting
                  ? "bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {t("rescheduling")}
                </>
              ) : (
                t("confirmNewDate")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
