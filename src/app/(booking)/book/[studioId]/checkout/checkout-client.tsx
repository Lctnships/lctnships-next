"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

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
  instant_book?: boolean
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
  "Photography Session",
  "Video Production",
  "Music Recording",
  "Podcast Recording",
  "Live Streaming",
  "Corporate Event",
  "Other",
]

export function CheckoutClient({
  studio,
  profile,
  equipment,
  equipmentSelections,
  bookingDetails,
}: CheckoutClientProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    productionType: "",
    specialRequests: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"ideal" | "card" | "paypal">("ideal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    return new Date(bookingDetails.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [bookingDetails.date])

  const handleSubmit = async () => {
    if (!agreedToTerms) return
    setIsSubmitting(true)

    try {
      const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}:00`)
      const endDateTime = new Date(`${bookingDetails.date}T${endTime}:00`)

      // The API recomputes prices, checks slot availability, notifies the
      // host and creates the renter<->host conversation — never insert
      // bookings directly from the client.
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio_id: studio.id,
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          notes: formData.specialRequests || null,
          production_type: formData.productionType || null,
          special_requests: formData.specialRequests || null,
          equipment_selections: equipmentSelections,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Booking failed", { description: data.error || "Please try again" })
        setIsSubmitting(false)
        return
      }

      if (studio.instant_book) {
        // Instant book: pay right away via Stripe Checkout
        const payRes = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.booking.id }),
        })
        const payData = await payRes.json()
        if (!payRes.ok || !payData.url) {
          // Booking exists but payment couldn't start; pay later from My Bookings
          toast.error("Payment could not be started", {
            description: "Your booking is saved — you can pay from My Bookings",
          })
          router.push(`/book/${studio.id}/success?booking=${data.booking.id}`)
          return
        }
        window.location.href = payData.url
        return
      }

      // Request-to-book: no payment yet, host has to accept first
      router.push(`/book/${studio.id}/success?booking=${data.booking.id}`)
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Booking failed", { description: "Please try again" })
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
              <span>Back</span>
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
                <span className="text-sm font-medium">Payment</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm text-gray-500">Confirm</span>
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
              <h2 className="text-xl font-semibold mb-6">Your Details</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                    placeholder="+31 6 12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production Type</label>
                  <div className="relative">
                    <select
                      value={formData.productionType}
                      onChange={(e) => setFormData({ ...formData, productionType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black appearance-none bg-white"
                    >
                      <option value="">Select type...</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none"
                  placeholder="Any special requirements or notes for the host..."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMethod("ideal")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "ideal" ? "border-black" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    iDEAL
                  </div>
                  <div className="text-left">
                    <div className="font-medium">iDEAL</div>
                    <div className="text-sm text-gray-500">Pay directly from your Dutch bank</div>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "ideal" ? "border-black" : "border-gray-300"
                  }`}>
                    {paymentMethod === "ideal" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "card" ? "border-black" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">credit_card</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Credit / Debit Card</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-black" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "paypal" ? "border-black" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white text-xs font-bold">
                    PayPal
                  </div>
                  <div className="text-left">
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "paypal" ? "border-black" : "border-gray-300"
                  }`}>
                    {paymentMethod === "paypal" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                  </div>
                </button>
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
                I agree to the{" "}
                <Link href="/terms" className="text-black underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-black underline">Privacy Policy</Link>
                . I understand that my booking is subject to the host&apos;s cancellation policy.
              </span>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white rounded-[2rem] p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

              {/* Studio Preview */}
              <div className="flex gap-4 pb-6 border-b border-gray-700">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  {coverImage ? (
                    <Image
                      src={coverImage.image_url}
                      alt={studio.title}
                      fill
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
                  <span className="text-gray-400">Studio rental</span>
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
                  <span className="text-gray-400">Service fee</span>
                  <span>€{calculations.serviceFee}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>€{calculations.total}</span>
                </div>
              </div>

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
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Pay €{calculations.total}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
