"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { generateBookingNumber } from "@/lib/utils/generate-booking-number"

interface Equipment {
  id: string
  name: string
  price_per_day: number
}

interface Studio {
  id: string
  title: string
  city?: string
  price_per_hour: number
  is_instant_book?: boolean
  host_id?: string
  studio_images?: { image_url: string; is_cover: boolean }[]
}

interface Profile {
  id: string
  full_name?: string
  email?: string
  phone?: string
}

interface CheckoutClientProps {
  studio: Studio
  profile: Profile | null
  equipment: Equipment[]
  equipmentSelections: Record<string, number>
  bookingDetails: {
    date: string
    startTime: string
    duration: number
  }
}

const PRODUCTION_TYPES = [
  "Fotosessie",
  "Videoproductie",
  "Muziekopname",
  "Podcast Opname",
  "Livestream",
  "Zakelijk Evenement",
  "Anders",
]

export function CheckoutClient({
  studio,
  profile,
  equipment,
  equipmentSelections,
  bookingDetails,
}: CheckoutClientProps) {
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    productionType: "",
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverImage = studio.studio_images?.find((img) => img.is_cover) || studio.studio_images?.[0]

  const calculations = useMemo(() => {
    const studioTotal = studio.price_per_hour * bookingDetails.duration
    const equipmentTotal = Object.entries(equipmentSelections).reduce((sum, [id, qty]) => {
      const item = equipment.find(e => e.id === id)
      return sum + (item?.price_per_day || 0) * qty
    }, 0)
    const subtotal = studioTotal + equipmentTotal
    const serviceFee = Math.round(subtotal * 0.10)
    const total = subtotal + serviceFee

    return { studioTotal, equipmentTotal, subtotal, serviceFee, total }
  }, [studio.price_per_hour, bookingDetails.duration, equipmentSelections, equipment])

  const endTime = useMemo(() => {
    const [hours, minutes] = bookingDetails.startTime.split(":").map(Number)
    const endHour = hours + bookingDetails.duration
    return `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }, [bookingDetails.startTime, bookingDetails.duration])

  const formattedDate = useMemo(() => {
    return new Date(bookingDetails.date).toLocaleDateString("nl-NL", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [bookingDetails.date])

  const handleSubmit = async () => {
    if (!agreedToTerms) return
    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create booking in Supabase
      const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}:00`)
      const endDateTime = new Date(`${bookingDetails.date}T${endTime}:00`)
      const bookingNumber = generateBookingNumber()

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_number: bookingNumber,
          studio_id: studio.id,
          renter_id: profile?.id,
          host_id: studio.host_id,
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          total_hours: bookingDetails.duration,
          subtotal: calculations.subtotal,
          service_fee: calculations.serviceFee,
          total_amount: calculations.total,
          host_payout: calculations.subtotal - Math.round(calculations.subtotal * 0.15),
          status: "pending",
          payment_status: "awaiting_payment",
          notes: formData.specialRequests || null,
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Step 2: Create Stripe Checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          studioId: studio.id,
          studioName: studio.title,
          totalAmount: calculations.total,
          customerEmail: formData.email || profile?.email,
          hours: bookingDetails.duration,
          date: bookingDetails.date,
          startTime: bookingDetails.startTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Betaalsessie kon niet worden aangemaakt")
      }

      // Step 3: Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Geen checkout URL ontvangen")
      }
    } catch (err: unknown) {
      console.error("Booking error:", err)
      setError(err instanceof Error ? err.message : "Er is iets misgegaan. Probeer het opnieuw.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/book/${studio.id}/session?date=${bookingDetails.date}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span>Terug</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
                <span className="text-sm text-gray-500">Details</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm font-medium">Betaling</span>
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
            {/* Your Details */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-6">Jouw Gegevens</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volledige Naam</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="Jan Jansen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mailadres</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="jan@voorbeeld.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefoonnummer</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="+31 6 12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Productietype</label>
                  <div className="relative">
                    <select
                      value={formData.productionType}
                      onChange={(e) => setFormData({ ...formData, productionType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black appearance-none bg-white"
                    >
                      <option value="">Selecteer type...</option>
                      {PRODUCTION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Speciale Verzoeken (Optioneel)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none"
                  placeholder="Eventuele speciale wensen of opmerkingen voor de host..."
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-4">Betaling</h2>
              <p className="text-gray-600 text-sm mb-6">
                Na het klikken op &quot;Betaal&quot; word je doorgestuurd naar Stripe voor een veilige betaling. Je kunt kiezen uit:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <div className="w-8 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded flex items-center justify-center text-white text-[10px] font-bold">
                    iDEAL
                  </div>
                  <span className="text-sm text-gray-700">iDEAL</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="material-symbols-outlined text-blue-600 text-base">credit_card</span>
                  <span className="text-sm text-gray-700">Credit/Debit Card</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-sm text-gray-700">SEPA</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-sm text-gray-700">Bancontact</span>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  agreedToTerms ? "bg-black border-black" : "border-gray-300"
                }`}
              >
                {agreedToTerms && (
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                )}
              </button>
              <span className="text-sm text-gray-600">
                Ik ga akkoord met de{" "}
                <Link href="/terms" className="text-black underline">Algemene Voorwaarden</Link>
                {" "}en het{" "}
                <Link href="/privacy" className="text-black underline">Privacybeleid</Link>
                . Ik begrijp dat mijn boeking onderhevig is aan het annuleringsbeleid van de host.
              </span>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white rounded-[2rem] p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-6">Overzicht</h3>

              {/* Studio Preview */}
              <div className="flex gap-4 pb-6 border-b border-gray-700">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  {coverImage ? (
                    <Image
                      src={coverImage.image_url}
                      alt={studio.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-500">image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{studio.title}</h4>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <span className="material-symbols-outlined text-base mr-1">location_on</span>
                    {studio.city || "Amsterdam"}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="py-6 border-b border-gray-700 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">schedule</span>
                  <span>{bookingDetails.startTime} - {endTime} ({bookingDetails.duration}h)</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-6 border-b border-gray-700 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Studiohuur</span>
                  <span>€{calculations.studioTotal}</span>
                </div>
                {Object.entries(equipmentSelections).map(([id, qty]) => {
                  const item = equipment.find(e => e.id === id)
                  if (!item) return null
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-gray-400">{item.name}</span>
                      <span>€{item.price_per_day * qty}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between">
                  <span className="text-gray-400">Servicekosten</span>
                  <span>€{calculations.serviceFee}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Totaal</span>
                  <span>€{calculations.total}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handleSubmit}
                disabled={!agreedToTerms || isSubmitting}
                className={`w-full py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                  agreedToTerms && !isSubmitting
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Verwerken...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Betaal €{calculations.total}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Veilige betaling via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
