"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"

interface CancelBookingModalProps {
  bookingId: string
  studioTitle?: string
  onClose: () => void
  onSuccess?: () => void
}

interface RefundPreview {
  policy: "flexible" | "moderate" | "strict" | string
  refund: { percentage: number; amount: number }
}

const policyLabels: Record<string, string> = {
  flexible: "Flexibel",
  moderate: "Gematigd",
  strict: "Strikt",
}

export function CancelBookingModal({ bookingId, studioTitle, onClose, onSuccess }: CancelBookingModalProps) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [preview, setPreview] = useState<RefundPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — fetch refund preview
  const handleRequestPreview = async () => {
    if (!reason.trim()) {
      setError("Geef een reden op voor de annulering.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kon annulering niet voorbereiden.")

      // Renter flow: API already cancelled without confirmation requirement.
      if (!data.preview) {
        onSuccess?.()
        router.refresh()
        onClose()
        return
      }
      setPreview({ policy: data.policy, refund: data.refund })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er is iets misgegaan.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 — confirm cancellation
  const handleConfirmCancel = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, confirmed: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Annulering mislukt.")
      onSuccess?.()
      router.refresh()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er is iets misgegaan.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        {!preview ? (
          <>
            <h3 className="text-xl font-bold mb-2">Boeking annuleren</h3>
            <p className="text-gray-500 mb-6 text-sm">
              {studioTitle ? `${studioTitle} — ` : ""}Geef een reden op. De huurder ontvangt deze bij de bevestiging.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Waarom annuleer je deze boeking?"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-black/20 mb-4"
            />
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Terug
              </button>
              <button
                onClick={handleRequestPreview}
                disabled={isLoading || !reason.trim()}
                className="flex-1 py-3 bg-black text-white rounded-full font-bold hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Laden…" : "Volgende"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Bevestig annulering</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Check de terugbetaling voor je bevestigt. Deze actie kan niet ongedaan gemaakt worden.
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Annuleringspolicy</span>
                <span className="font-medium capitalize">{policyLabels[preview.policy] ?? preview.policy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Terugbetaling (%)</span>
                <span className="font-medium">{preview.refund.percentage}%</span>
              </div>
              <div className="flex justify-between text-base pt-3 border-t border-gray-200">
                <span className="font-bold">Bedrag terugbetaling</span>
                <span className="font-bold">€{preview.refund.amount.toFixed(2)}</span>
              </div>
            </div>
            {preview.refund.amount === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mb-4">
                Op basis van de annuleringspolicy krijgt de huurder geen terugbetaling.
              </p>
            )}
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setPreview(null)}
                disabled={isLoading}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Terug
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Annuleren…" : "Bevestig annulering"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
