"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Star } from "lucide-react"
import { Tables } from "@/types/database.types"
import { formatCurrency, formatPrice } from "@/lib/utils/format-currency"
import { calculateBooking } from "@/lib/utils/calculate-booking"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface BookingCardProps {
  studio: Tables<"studios">
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return { value: `${hour}:00`, label: `${hour}:00` }
})

export function BookingCard({ studio }: BookingCardProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState<string>()
  const [endTime, setEndTime] = useState<string>()

  const canCalculate = date && startTime && endTime

  const calculation = canCalculate
    ? calculateBooking(
        studio.price_per_hour,
        new Date(`${format(date, "yyyy-MM-dd")}T${startTime}`),
        new Date(`${format(date, "yyyy-MM-dd")}T${endTime}`)
      )
    : null

  const handleBooking = () => {
    if (!date || !startTime || !endTime) return

    const params = new URLSearchParams({
      date: format(date, "yyyy-MM-dd"),
      start: startTime,
      end: endTime,
    })

    router.push(`/book/${studio.id}?${params.toString()}`)
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-2xl">
            {formatPrice(studio.price_per_hour)}
          </CardTitle>
          {studio.avg_rating > 0 && (
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{studio.avg_rating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">
                ({studio.total_reviews})
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date picker */}
        <div>
          <label className="text-sm font-medium mb-2 block">Datum</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: nl }) : "Selecteer een datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Starttijd</label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="Starttijd" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Eindtijd</label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger>
                <SelectValue placeholder="Eindtijd" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots
                  .filter((slot) => !startTime || slot.value > startTime)
                  .map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price breakdown */}
        {calculation && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
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
              <div className="flex justify-between font-semibold">
                <span>Totaal</span>
                <span>{formatCurrency(calculation.totalAmount)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleBooking}
          disabled={!canCalculate || (calculation?.totalHours || 0) < studio.min_booking_hours}
        >
          {studio.instant_book ? "Direct boeken" : "Boekingsverzoek"}
        </Button>
      </CardFooter>

      {studio.min_booking_hours > 1 && (
        <p className="text-xs text-muted-foreground text-center pb-4">
          Minimaal {studio.min_booking_hours} uur boeking
        </p>
      )}
    </Card>
  )
}
