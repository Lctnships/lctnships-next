"use client"

import { useState, useMemo } from "react"
import { Link } from "@/i18n/routing"

interface BookingWithStudio {
  id: string
  total_amount: number
  total_hours: number
  start_datetime: string
  end_datetime: string
  payment_deadline: string | null
  booking_number: string
  studio: {
    id: string
    title: string
    city?: string
    location?: string
    price_per_hour: number
  } | null
}

interface PayClientProps {
  booking: BookingWithStudio
}

export function PayClient({ booking }: PayClientProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = new Date(booking.start_datetime)
  const end = new Date(booking.end_datetime)

  const deadline = useMemo(() => {
    if (!booking.payment_deadline) return null
    return new Date(booking.payment_deadline)
  }, [booking.payment_deadline])

  const hoursLeft = useMemo(() => {
    if (!deadline) return null
    const ms = deadline.getTime() - Date.now()
    if (ms <= 0) return 0
    return Math.max(1, Math.round(ms / (1000 * 60 * 60)))
  }, [deadline])

  const handlePay = async () => {
    if (!booking.studio) return
    setIsStarting(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          studioId: booking.studio.id,
          studioName: booking.studio.title,
          totalAmount: booking.total_amount,
          hours: booking.total_hours,
          date: start.toISOString().slice(0, 10),
          startTime: `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Kan betaling niet starten")
      if (!data.url) throw new Error("Geen checkout URL ontvangen")
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan")
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href={`/bookings/${booking.id}`} className="text-sm text-gray-600 hover:text-gray-900">
          ← Terug
        </Link>

        <div className="bg-white rounded-3xl p-8 mt-6 shadow-sm">
          <h1 className="text-3xl font-bold">Aanvraag goedgekeurd</h1>
          <p className="text-gray-600 mt-2">
            De host heeft je aanvraag geaccepteerd. Rond de betaling af om de boeking definitief te maken.
          </p>

          {deadline && hoursLeft !== null && (
            <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
              <strong>Betaal binnen {hoursLeft} uur</strong> — anders vervalt de reservering.
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Studio</span>
              <span className="font-medium">{booking.studio?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Locatie</span>
              <span>{booking.studio?.city ?? booking.studio?.location ?? "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Datum</span>
              <span>{start.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tijd</span>
              <span>
                {start.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} – {end.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uren</span>
              <span>{booking.total_hours}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-100">
              <span>Totaal</span>
              <span>€{booking.total_amount}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={isStarting || !booking.studio}
            className="w-full mt-6 py-4 rounded-full bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-60"
          >
            {isStarting ? "Doorverwijzen naar Stripe..." : `Betaal €${booking.total_amount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
