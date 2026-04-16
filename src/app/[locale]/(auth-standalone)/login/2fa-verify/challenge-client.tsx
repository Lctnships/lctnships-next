"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { verifyLoginChallenge } from "@/app/actions/mfa"

interface TwoFactorChallengeClientProps {
  redirect?: string
}

export function TwoFactorChallengeClient({ redirect }: TwoFactorChallengeClientProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [pending, startTransition] = useTransition()

  const submit = () =>
    startTransition(async () => {
      const res = await verifyLoginChallenge(code.trim())
      if (!res.ok) {
        toast.error(res.error ?? "Code onjuist")
        setCode("")
        return
      }
      toast.success("Welkom terug")
      router.push((redirect ?? "/dashboard") as "/dashboard")
      router.refresh()
    })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Tweestapsverificatie</h1>
          <p className="text-sm text-gray-600 mt-1">
            Voer de 6-cijferige code in uit je authenticator-app.
          </p>
        </div>

        <input
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.length === 6) submit()
          }}
          className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-3xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="• • • • • •"
        />

        <button
          onClick={submit}
          disabled={pending || code.length !== 6}
          className="w-full rounded-full bg-black text-white py-3 text-sm font-semibold hover:bg-black/90 disabled:opacity-60"
        >
          {pending ? "Verifiëren..." : "Inloggen"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Geen toegang tot je app? Neem contact op met support.
        </p>
      </div>
    </div>
  )
}
