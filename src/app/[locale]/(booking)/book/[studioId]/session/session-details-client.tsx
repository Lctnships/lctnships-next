"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Link, useRouter } from "@/i18n/routing"

interface Equipment {
  id: string
  name: string
  description?: string
  price_per_day: number
  image_url?: string | null
}

interface Studio {
  id: string
  title: string
  city?: string
  price_per_hour: number
  studio_images?: { image_url: string; is_cover: boolean }[]
}

interface SessionDetailsClientProps {
  studio: Studio
  equipment: Equipment[]
  initialDate?: string
  initialTime?: string
  initialDuration?: number
  initialEquipment?: Record<string, number>
}

const DURATION_OPTIONS = [
  { hours: 1, label: "1 uur" },
  { hours: 2, label: "2 uur" },
  { hours: 4, label: "Halve Dag", sublabel: "4 uur" },
  { hours: 8, label: "Hele Dag", sublabel: "8 uur" },
]

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
]

export function SessionDetailsClient({ studio, equipment, initialDate, initialTime, initialDuration, initialEquipment }: SessionDetailsClientProps) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(initialDuration || 2)
  const [selectedTime, setSelectedTime] = useState(initialTime || "10:00")
  const [selectedDate, _setSelectedDate] = useState(initialDate || new Date().toISOString().split("T")[0])
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, number>>(initialEquipment || {})

  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]

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
    const studioTotal = studio.price_per_hour * selectedDuration
    const equipmentTotal = Object.entries(selectedEquipment).reduce((sum, [id, qty]) => {
      const item = equipment.find(e => e.id === id)
      return sum + (item?.price_per_day || 0) * qty
    }, 0)
    const subtotal = studioTotal + equipmentTotal
    const total = subtotal

    return { studioTotal, equipmentTotal, subtotal, total }
  }, [studio.price_per_hour, selectedDuration, selectedEquipment, equipment])

  const handleContinue = () => {
    const params = new URLSearchParams({
      date: selectedDate,
      start: selectedTime,
      duration: selectedDuration.toString(),
    })

    Object.entries(selectedEquipment).forEach(([id, qty]) => {
      params.append(`eq_${id}`, qty.toString())
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
              <span>Terug</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-sm font-medium">Details</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm text-gray-500">Betaling</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm text-gray-500">Bevestigen</span>
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
              <h2 className="text-xl font-semibold mb-2">Sessieduur</h2>
              <p className="text-gray-500 mb-6">Kies hoe lang je de studio nodig hebt</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => setSelectedDuration(option.hours)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${
                      selectedDuration === option.hours
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    {option.sublabel && (
                      <div className={`text-sm ${selectedDuration === option.hours ? "text-gray-300" : "text-gray-500"}`}>
                        {option.sublabel}
                      </div>
                    )}
                    <div className={`text-lg font-bold mt-2 ${selectedDuration === option.hours ? "text-white" : "text-black"}`}>
                      €{studio.price_per_hour * option.hours}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-2">Beschikbare Starttijden</h2>
              <p className="text-gray-500 mb-6">
                {new Date(selectedDate).toLocaleDateString("nl-NL", { weekday: "long", month: "long", day: "numeric" })}
              </p>

              <div className="flex flex-wrap gap-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-5 py-3 rounded-full font-medium transition-all ${
                      selectedTime === time
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Add-ons */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-2">Apparatuur Toevoegen</h2>
              <p className="text-gray-500 mb-6">Verbeter je sessie met professionele apparatuur</p>

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
                    {studio.city || "Amsterdam"}
                  </div>
                  <div className="flex items-center text-sm mt-1">
                    <span className="material-symbols-outlined text-yellow-500 text-base mr-1">star</span>
                    <span className="font-medium">4.9</span>
                    <span className="text-gray-400 ml-1">(128)</span>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="py-6 border-b border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Datum</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString("nl-NL", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tijd</span>
                  <span className="font-medium">{selectedTime} - {
                    (() => {
                      const [hours, minutes] = selectedTime.split(":").map(Number)
                      const endHour = hours + selectedDuration
                      return `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                    })()
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duur</span>
                  <span className="font-medium">{selectedDuration} uur</span>
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
                  <span>Totaal</span>
                  <span>€{calculations.total}</span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Doorgaan naar Betaling
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
