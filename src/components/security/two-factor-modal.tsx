"use client"

import { useState, useTransition } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { enrollMfa, verifyEnrollment, unenrollMfa, type EnrollResult } from "@/app/actions/mfa"

interface TwoFactorModalProps {
  open: boolean
  onClose: () => void
  // Called after a successful enroll OR successful unenroll, with the new state
  onChange: (enabled: boolean) => void
  initialMode: "enroll" | "disable"
}

export function TwoFactorModal({ open, onClose, onChange, initialMode }: TwoFactorModalProps) {
  const [mode, setMode] = useState<"enroll" | "disable">(initialMode)
  const [enrollment, setEnrollment] = useState<EnrollResult | null>(null)
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"start" | "scan" | "verify">("start")
  const [pending, startTransition] = useTransition()

  if (!open) return null

  const beginEnroll = () =>
    startTransition(async () => {
      const res = await enrollMfa()
      if (!res.ok || !res.data) {
        toast.error(res.error ?? "Enroll failed")
        return
      }
      setEnrollment(res.data)
      setStep("scan")
    })

  const submitVerify = () =>
    startTransition(async () => {
      if (!enrollment) return
      const res = await verifyEnrollment(enrollment.factorId, code.trim())
      if (!res.ok) {
        toast.error(res.error ?? "Verify failed")
        return
      }
      toast.success("Tweestapsverificatie geactiveerd")
      onChange(true)
      reset()
      onClose()
    })

  const submitUnenroll = () =>
    startTransition(async () => {
      const res = await unenrollMfa()
      if (!res.ok) {
        toast.error(res.error ?? "Disable failed")
        return
      }
      toast.success("Tweestapsverificatie uitgeschakeld")
      onChange(false)
      reset()
      onClose()
    })

  const reset = () => {
    setEnrollment(null)
    setCode("")
    setStep("start")
    setMode("enroll")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4">
        {mode === "disable" ? (
          <>
            <h2 className="text-xl font-bold">Tweestapsverificatie uitschakelen?</h2>
            <p className="text-sm text-gray-600">
              Je account is dan minder veilig. Je kunt het later weer aanzetten.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { reset(); onClose() }}
                disabled={pending}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={submitUnenroll}
                disabled={pending}
                className="rounded-full bg-red-600 text-white px-5 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Bezig..." : "Uitschakelen"}
              </button>
            </div>
          </>
        ) : step === "start" ? (
          <>
            <h2 className="text-xl font-bold">Tweestapsverificatie inschakelen</h2>
            <p className="text-sm text-gray-600">
              Je hebt een authenticator-app nodig (Google Authenticator, Authy, 1Password).
              Bij elke login vragen we daarna een 6-cijferige code uit die app.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { reset(); onClose() }}
                disabled={pending}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={beginEnroll}
                disabled={pending}
                className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-black/90 disabled:opacity-60"
              >
                {pending ? "Bezig..." : "Doorgaan"}
              </button>
            </div>
          </>
        ) : step === "scan" && enrollment ? (
          <>
            <h2 className="text-xl font-bold">Scan deze QR-code</h2>
            <p className="text-sm text-gray-600">
              Open je authenticator-app en scan de code. Lukt scannen niet, voer dan
              handmatig dit secret in: <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{enrollment.secret}</code>
            </p>
            <div className="flex justify-center bg-white p-4 rounded-2xl">
              <QRCodeSVG value={enrollment.qrCode} size={196} level="M" includeMargin />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStep("verify")}
                className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-black/90"
              >
                Volgende
              </button>
            </div>
          </>
        ) : step === "verify" ? (
          <>
            <h2 className="text-xl font-bold">Voer de code in</h2>
            <p className="text-sm text-gray-600">
              Type de 6-cijferige code die je app nu toont.
            </p>
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="• • • • • •"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStep("scan")}
                disabled={pending}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Terug
              </button>
              <button
                onClick={submitVerify}
                disabled={pending || code.length !== 6}
                className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-black/90 disabled:opacity-60"
              >
                {pending ? "Verifiëren..." : "Activeren"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
