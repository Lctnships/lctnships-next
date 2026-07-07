"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export function BookingListActions({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Kon boeking niet bevestigen", { description: data.error })
        return
      }
      toast.success("Boeking bevestigd")
      router.refresh()
    } catch {
      toast.error("Kon boeking niet bevestigen")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-2">
      {/* Decline needs a reason: handled in the booking detail modal */}
      <Button
        size="sm"
        variant="outline"
        className="text-red-600"
        disabled={isProcessing}
        onClick={() => router.push(`/host/bookings/${bookingId}`)}
      >
        <X className="h-4 w-4 mr-1" />
        Afwijzen
      </Button>
      <Button size="sm" disabled={isProcessing} onClick={handleAccept}>
        <Check className="h-4 w-4 mr-1" />
        {isProcessing ? "Bezig..." : "Accepteren"}
      </Button>
    </div>
  )
}
