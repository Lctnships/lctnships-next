"use client"

import { useState, useMemo } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ArrowLeft, Loader2 } from "lucide-react"

interface Equipment {
  id: string
  name: string
  price_per_day: number
}

interface BookingEquipment {
  id: string
  quantity: number
  equipment: Equipment
}

interface BookingBlock {
  duration_hours: number
  price: number
}

interface Studio {
  id: string
  title: string
  price_per_hour: number
  booking_mode?: 'flexible' | 'fixed_blocks'
  booking_blocks?: BookingBlock[]
  allow_extensions?: boolean
  max_extension_hours?: number | null
  city?: string
  studio_images?: { image_url: string; is_cover: boolean }[]
}

interface Booking {
  id: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  studio: Studio
  booking_equipment: BookingEquipment[]
}

interface ExtendSessionClientProps {
  booking: Booking
  availableHours: number
}

export function ExtendSessionClient({ booking, availableHours }: ExtendSessionClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedHours, setSelectedHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverImage = booking.studio.studio_images?.find(img => img.is_cover) || booking.studio.studio_images?.[0]

  const studioPricePerHour = useMemo(() => {
    if (booking.studio.booking_mode === 'fixed_blocks' && booking.studio.booking_blocks) {
      const hours = booking.total_hours + selectedHours
      const block = booking.studio.booking_blocks.find(b => b.duration_hours >= hours)
      if (block) {
        return block.price / block.duration_hours
      }
    }
    return booking.studio.price_per_hour
  }, [booking.studio, selectedHours, booking.total_hours])

  const equipmentPerHour = useMemo(() => {
    return booking.booking_equipment.reduce((sum, item) => {
      return sum + (item.equipment.price_per_day / 8) * item.quantity
    }, 0)
  }, [booking.booking_equipment])

  const pricing = useMemo(() => {
    const studioTotal = studioPricePerHour * selectedHours
    const equipmentTotal = equipmentPerHour * selectedHours
    const subtotal = studioTotal + equipmentTotal

    return {
      studioPerHour: studioPricePerHour,
      equipmentPerHour,
      studioTotal,
      equipmentTotal,
      subtotal
    }
  }, [studioPricePerHour, equipmentPerHour, selectedHours])

  const startDate = new Date(booking.start_datetime)
  const endDate = new Date(booking.end_datetime)
  const newEndDate = new Date(endDate.getTime() + selectedHours * 60 * 60 * 1000)

  const hourOptions = Array.from({ length: Math.min(Math.floor(availableHours), 8) }, (_, i) => i + 1)

  const handleExtend = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${booking.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extra_hours: selectedHours })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create extension")
      }

      const paymentRes = await fetch("/api/stripe/extension-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          extension_id: data.extension.id,
          amount: data.pricing.total
        })
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || "Failed to create payment")
      }

      if (paymentData.url) {
        window.location.href = paymentData.url
      } else {
        router.push(`/bookings/${booking.id}/extend/success?extension=${data.extension.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Terug</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sessie Verlengen</h1>
          <p className="text-gray-600 mt-2">Verleng je sessie bij {booking.studio.title}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Huidige Booking</h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden relative">
                  {coverImage && (
                    <Image src={coverImage.image_url} alt={booking.studio.title} fill className="object-cover" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{booking.studio.title}</h3>
                  <p className="text-sm text-gray-500">{booking.studio.city}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {startDate.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} —{" "}
                    {endDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Kies verlengingsduur</h2>
              <div className="grid grid-cols-3 gap-3">
                {hourOptions.map(hours => (
                  <button
                    key={hours}
                    onClick={() => setSelectedHours(hours)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedHours === hours
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">+{hours} {hours === 1 ? "uur" : "uur"}</div>
                    <div className={`text-sm mt-1 ${selectedHours === hours ? "text-gray-300" : "text-gray-500"}`}>
                      €{(pricing.subtotal * (hours / selectedHours)).toFixed(0)}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Maximale beschikbaarheid: {Math.floor(availableHours)} uur
              </p>
            </div>

            {booking.booking_equipment.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Equipment (wordt automatisch verlengd)</h2>
                <div className="space-y-3">
                  {booking.booking_equipment.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.equipment.name} (x{item.quantity})</span>
                      <span className="text-gray-500 text-sm">
                        €{(item.equipment.price_per_day / 8 * item.quantity).toFixed(2)}/uur
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between font-medium">
                    <span>Totaal equipment/uur</span>
                    <span>€{pricing.equipmentPerHour.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Overzicht</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Studio ({pricing.studioPerHour.toFixed(2)}/uur × {selectedHours}h)</span>
                  <span>€{pricing.studioTotal.toFixed(2)}</span>
                </div>
                {pricing.equipmentPerHour > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment ({pricing.equipmentPerHour.toFixed(2)}/uur × {selectedHours}h)</span>
                    <span>€{pricing.equipmentTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between font-semibold text-lg">
                  <span>Totaal</span>
                  <span>€{pricing.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Nieuwe eindtijd:</span>{" "}
                  {newEndDate.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} {" "}
                  om {newEndDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleExtend}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verwerken...
                  </>
                ) : (
                  `Verleng voor €${pricing.subtotal.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Betaling via Stripe. 15% platform fee van toepassing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}