"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"
import { formatDate as fmtDate } from "@/lib/format-locale"
import { getAvailableDurations, snapToAvailable } from "@/lib/booking-duration"

interface Equipment {
  id: string
  name: string
  description?: string
  price_per_day: number
  image_url?: string | null
}

interface BookingBlock {
  duration_hours: number
  price: number
  sort_order: number
}

interface Studio {
  id: string
  title: string
  city?: string
  price_per_hour: number
  minimum_hours?: number | null
  maximum_hours?: number | null
  studio_images?: { image_url: string; is_cover: boolean }[]
  booking_mode?: 'flexible' | 'fixed_blocks'
  booking_blocks?: BookingBlock[]
  booking_lead_time_hours?: number
}

interface ServiceItem {
  id: string
  name: string
  description?: string | null
  price: number
  pricing_unit: "flat" | "per_hour" | "per_session"
  studio_id?: string | null
}

interface SessionDetailsClientProps {
  studio: Studio
  equipment: Equipment[]
  services?: ServiceItem[]
  initialDate?: string
  initialTime?: string
  initialDuration?: number
  initialEquipment?: Record<string, number>
  initialServices?: Record<string, number>
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
]

export function SessionDetailsClient({
  studio,
  equipment,
  services = [],
  initialDate,
  initialTime,
  initialDuration,
  initialEquipment,
  initialServices,
}: SessionDetailsClientProps) {
  const router = useRouter()
  const t = useTranslations("SessionDetails")
  const locale = useLocale()
  const availableDurations = useMemo(() => getAvailableDurations(studio), [studio])
  const [selectedDuration, setSelectedDuration] = useState(() =>
    snapToAvailable(studio, initialDuration || availableDurations[0] || 2)
  )
  const [selectedTime, setSelectedTime] = useState(initialTime || "10:00")
  const [selectedDate, _setSelectedDate] = useState(initialDate || new Date().toISOString().split("T")[0])
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, number>>(initialEquipment || {})
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>(initialServices || {})

  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]
  const leadTimeHours = studio.booking_lead_time_hours || 0

  const isTimeSlotDisabled = (time: string) => {
    if (leadTimeHours <= 0) return false
    const [h, m] = time.split(":").map(Number)
    const slotDate = new Date(selectedDate)
    slotDate.setHours(h, m, 0, 0)
    const hoursUntil = (slotDate.getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursUntil < leadTimeHours
  }

  const handleEquipmentChange = (equipmentId: string, delta: number) => {
    setSelectedEquipment(prev => {
      const current = prev[equipmentId] || 0
      const newValue = Math.max(0, current + delta)
      if (newValue === 0) {
        const { [equipmentId]: __, ...rest } = prev
        return rest
      }
      return { ...prev, [equipmentId]: newValue }
    })
  }

  const calculations = useMemo(() => {
    let studioTotal: number
    if (studio.booking_mode === 'fixed_blocks' && studio.booking_blocks) {
      const selectedBlock = studio.booking_blocks.find(b => b.duration_hours === selectedDuration)
      studioTotal = selectedBlock?.price || studio.price_per_hour * selectedDuration
    } else {
      studioTotal = studio.price_per_hour * selectedDuration
    }
    const equipmentTotal = Object.entries(selectedEquipment).reduce((sum, [id, qty]) => {
      const item = equipment.find(e => e.id === id)
      return sum + (item?.price_per_day || 0) * qty
    }, 0)
    const servicesTotal = Object.entries(selectedServices).reduce((sum, [id, qty]) => {
      const svc = services.find((s) => s.id === id)
      if (!svc) return sum
      const multiplier =
        svc.pricing_unit === "per_hour" ? selectedDuration :
        svc.pricing_unit === "per_session" ? 1 :
        1
      return sum + svc.price * qty * multiplier
    }, 0)
    const subtotal = studioTotal + equipmentTotal + servicesTotal
    const total = subtotal

    return { studioTotal, equipmentTotal, servicesTotal, subtotal, total }
  }, [studio.price_per_hour, studio.booking_mode, studio.booking_blocks, selectedDuration, selectedEquipment, selectedServices, equipment, services])

  const handleContinue = () => {
    const params = new URLSearchParams({
      date: selectedDate,
      start: selectedTime,
      duration: selectedDuration.toString(),
    })

    Object.entries(selectedEquipment).forEach(([id, qty]) => {
      params.append(`eq_${id}`, qty.toString())
    })
    Object.entries(selectedServices).forEach(([id, qty]) => {
      params.append(`svc_${id}`, qty.toString())
    })

    router.push(`/book/${studio.id}/checkout?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/studios/${studio.id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span>{t("back")}</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-sm font-medium">{t("stepDetails")}</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm text-gray-500">{t("stepPayment")}</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm text-gray-500">{t("stepConfirm")}</span>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Duration Selection */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-2">{t("sessionDuration")}</h2>
              <p className="text-gray-500 mb-6">
                {studio.booking_mode === 'fixed_blocks'
                  ? t("chooseBlockSubtitle")
                  : t("chooseDurationSubtitle")}
              </p>

              {studio.booking_mode === 'fixed_blocks' && studio.booking_blocks && studio.booking_blocks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studio.booking_blocks.map((block, index) => {
                    const isSelected = selectedDuration === block.duration_hours
                    const label = block.duration_hours >= 8 ? t("fullDay") :
                                  block.duration_hours === 4 ? t("halfDay") :
                                  t("hours", { count: block.duration_hours })
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDuration(block.duration_hours)}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">{label}</div>
                        <div className={`text-sm ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                          {t("hours", { count: block.duration_hours })}
                        </div>
                        <div className={`text-lg font-bold mt-2 ${isSelected ? "text-white" : "text-black"}`}>
                          €{block.price}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableDurations.map((hours) => {
                    const label = hours >= 8 ? t("fullDay") : hours === 4 ? t("halfDay") : t("hours", { count: hours })
                    const isSelected = selectedDuration === hours
                    return (
                      <button
                        key={hours}
                        onClick={() => setSelectedDuration(hours)}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">{label}</div>
                        <div className={`text-lg font-bold mt-2 ${isSelected ? "text-white" : "text-black"}`}>
                          €{studio.price_per_hour * hours}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-2">{t("availableStartTimes")}</h2>
              <p className="text-gray-500 mb-6">
                {fmtDate(selectedDate, locale, { weekday: "long", month: "long", day: "numeric" })}
              </p>

              <div className="flex flex-wrap gap-3">
                {TIME_SLOTS.map((time) => {
                  const disabled = isTimeSlotDisabled(time)
                  return (
                    <button
                      key={time}
                      onClick={() => !disabled && setSelectedTime(time)}
                      disabled={disabled}
                      className={`px-5 py-3 rounded-full font-medium transition-all ${
                        disabled
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                          : selectedTime === time
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
              {leadTimeHours > 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {t("leadTimeWarning", { hours: leadTimeHours })}
                </p>
              )}
            </div>

            {/* Equipment Add-ons */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-2">{t("addEquipment")}</h2>
              <p className="text-gray-500 mb-6">{t("addEquipmentSubtitle")}</p>

              <div className="space-y-4">
                {equipment.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 text-2xl">
                          {item.name.toLowerCase().includes("light") ? "light_mode" :
                           item.name.toLowerCase().includes("backdrop") ? "wallpaper" :
                           item.name.toLowerCase().includes("assistant") ? "person" :
                           item.name.toLowerCase().includes("catering") ? "restaurant" : "inventory_2"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">€{item.price_per_day}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEquipmentChange(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          disabled={!selectedEquipment[item.id]}
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="w-6 text-center font-medium">
                          {selectedEquipment[item.id] || 0}
                        </span>
                        <button
                          onClick={() => handleEquipmentChange(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Add-ons */}
            {services.length > 0 && (
              <div className="bg-white rounded-[2rem] p-8">
                <h2 className="text-xl font-semibold mb-2">Diensten</h2>
                <p className="text-gray-500 mb-6">Voeg extra diensten toe die de host aanbiedt.</p>

                <div className="space-y-4">
                  {services.map((svc) => {
                    const qty = selectedServices[svc.id] || 0
                    const unitLabel =
                      svc.pricing_unit === "per_hour" ? "per uur" :
                      svc.pricing_unit === "per_session" ? "per sessie" : "per dienst"
                    return (
                      <div
                        key={svc.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-gray-400 text-2xl">work</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{svc.name}</h3>
                            {svc.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">{svc.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="font-semibold">€{svc.price}</div>
                            <div className="text-xs text-gray-500">{unitLabel}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setSelectedServices((prev) => {
                                  const cur = prev[svc.id] || 0
                                  if (cur <= 1) {
                                    const { [svc.id]: __, ...rest } = prev
                                    return rest
                                  }
                                  return { ...prev, [svc.id]: cur - 1 }
                                })
                              }
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-40"
                              disabled={qty === 0}
                            >
                              <span className="material-symbols-outlined text-lg">remove</span>
                            </button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <button
                              onClick={() =>
                                setSelectedServices((prev) => ({ ...prev, [svc.id]: (prev[svc.id] || 0) + 1 }))
                              }
                              className="w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 sticky top-8">
              {/* Studio Preview */}
              <div className="flex gap-4 pb-6 border-b border-gray-100">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  {coverImage ? (
                    <Image
                      src={coverImage.image_url}
                      alt={studio.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{studio.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="material-symbols-outlined text-base mr-1">location_on</span>
                    {studio.city || ""}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="py-6 border-b border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("date")}</span>
                  <span className="font-medium">
                    {fmtDate(selectedDate, locale)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("time")}</span>
                  <span className="font-medium">{selectedTime} - {
                    (() => {
                      const [hours, minutes] = selectedTime.split(":").map(Number)
                      const endHour = hours + selectedDuration
                      return `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                    })()
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("duration")}</span>
                  <span className="font-medium">{t("hours", { count: selectedDuration })}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Studio ({selectedDuration}h × €{studio.price_per_hour})</span>
                  <span>€{calculations.studioTotal}</span>
                </div>
                {Object.entries(selectedEquipment).map(([id, qty]) => {
                  const item = equipment.find(e => e.id === id)
                  if (!item) return null
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-gray-600">{item.name} × {qty}</span>
                      <span>€{item.price_per_day * qty}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between pt-4 border-t border-gray-100 text-lg font-semibold">
                  <span>{t("total")}</span>
                  <span>€{calculations.total}</span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                {t("continueToPayment")}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
