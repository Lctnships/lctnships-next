"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { InsertTables } from "@/types/database.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PageLoader } from "@/components/shared/loading-spinner"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDate, formatTime } from "@/lib/utils/format-date"
import { calculateBooking } from "@/lib/utils/calculate-booking"
import { generateBookingNumber } from "@/lib/utils/generate-booking-number"
import { Calendar, Clock, MapPin, ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import { toast } from "sonner"
import { use } from "react"

interface StudioImage {
  image_url: string
  is_cover: boolean
}

interface BookStudio {
  id: string
  title: string
  city: string
  price_per_hour: number
  is_instant_book?: boolean
  host?: { id: string }
  studio_images?: StudioImage[]
}

interface BookPageProps {
  params: Promise<{ studioId: string }>
}

export default function BookPage({ params }: BookPageProps) {
  const { studioId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [studio, setStudio] = useState<BookStudio | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState("")

  const date = searchParams.get("date")
  const startTime = searchParams.get("start")
  const endTime = searchParams.get("end")

  useEffect(() => {
    async function loadData() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/book/${studioId}?${searchParams.toString()}`)
        return
      }
      setUser(user)

      // Get studio
      const { data: studioData } = await supabase
        .from("studios")
        .select(`
          *,
          studio_images (image_url, is_cover),
          host:users!studios_host_id_fkey (id)
        `)
        .eq("id", studioId)
        .single()

      if (!studioData) {
        toast.error("Studio niet gevonden")
        router.push("/studios")
        return
      }

      setStudio(studioData)
      setIsLoading(false)
    }

    loadData()
  }, [studioId, supabase, router, searchParams])

  if (isLoading || !studio || !date || !startTime || !endTime) {
    return <PageLoader />
  }

  const startDateTime = new Date(`${date}T${startTime}`)
  const endDateTime = new Date(`${date}T${endTime}`)
  const calculation = calculateBooking(studio.price_per_hour, startDateTime, endDateTime)

  const coverImage = studio.studio_images?.find((img: StudioImage) => img.is_cover) ||
    studio.studio_images?.[0]

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)

    try {
      // Create booking
      const bookingNumber = generateBookingNumber()

      const bookingData: InsertTables<"bookings"> = {
        booking_number: bookingNumber,
        studio_id: studio.id,
        renter_id: user.id,
        host_id: studio.host?.id,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        total_hours: calculation.totalHours,
        subtotal: calculation.subtotal,
        service_fee: calculation.serviceFee,
        total_amount: calculation.totalAmount,
        host_payout: calculation.hostPayout,
        status: studio.is_instant_book ? "confirmed" : "pending",
        payment_status: "pending",
        notes: notes || null,
      }

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error

      // TODO: Redirect to Stripe checkout
      // For now, redirect to booking confirmation
      toast.success(
        studio.is_instant_book
          ? "Boeking bevestigd!"
          : "Boekingsaanvraag verstuurd!"
      )
      router.push(`/bookings/${booking.id}`)
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Er ging iets mis bij het boeken")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back button */}
      <Link href={`/studios/${studioId}`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar studio
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Bevestig je boeking</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left - Booking form */}
        <div className="space-y-6">
          {/* Studio summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  {coverImage ? (
                    <Image
                      src={coverImage.image_url}
                      alt={studio.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{studio.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {studio.city}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking details */}
          <Card>
            <CardHeader>
              <CardTitle>Boekingsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Datum</p>
                  <p className="text-muted-foreground">
                    {formatDate(startDateTime, "EEEE d MMMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Tijd</p>
                  <p className="text-muted-foreground">
                    {formatTime(startDateTime)} - {formatTime(endDateTime)} ({calculation.totalHours} uur)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notities voor de host</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes" className="sr-only">Notities</Label>
              <Textarea
                id="notes"
                placeholder="Laat de host weten wat je komt doen, speciale wensen, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right - Price summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Prijsoverzicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {formatCurrency(studio.price_per_hour)} x {calculation.totalHours} uur
                </span>
                <span>{formatCurrency(calculation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Servicekosten</span>
                <span>{formatCurrency(calculation.serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Totaal</span>
                <span>{formatCurrency(calculation.totalAmount)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {studio.is_instant_book ? "Betalen en boeken" : "Aanvraag versturen"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {studio.is_instant_book
                  ? "Je boeking wordt direct bevestigd na betaling"
                  : "De host moet je aanvraag nog accepteren"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
