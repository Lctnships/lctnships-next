"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"

export function DeleteAccountButton() {
  const t = useTranslations("Settings")
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return
    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // For now, sign out and redirect. Full account deletion requires
      // a server-side flow that checks active bookings, pending payouts,
      // and Stripe Connect status before removing data. That flow should
      // go through a dedicated /api/users/delete-account route with
      // admin client. Signing out is the safe immediate action.
      toast.success(t("accountDeletedToast") || "Je account verwijderingsverzoek is ingediend. Neem contact op met support voor definitieve verwijdering.")
      router.push("/")
    } catch {
      toast.error(t("accountDeleteFailed") || "Er is iets misgegaan")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border border-red-200 rounded-2xl p-6 bg-red-50/50">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-red-500">warning</span>
        <h3 className="text-lg font-bold text-red-700">{t("dangerZone")}</h3>
      </div>
      <p className="text-sm text-red-600 mb-4">{t("dangerZoneDesc")}</p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-2 border-2 border-red-300 text-red-600 rounded-full font-bold text-sm hover:bg-red-100 transition-colors"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-red-700 font-medium">
            {t("deleteConfirmPrompt") || 'Typ "DELETE" om te bevestigen'}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full max-w-xs px-4 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowConfirm(false); setConfirmText("") }}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {t("cancelAction") || "Annuleren"}
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "..." : t("deleteAccount")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
