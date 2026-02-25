"use client"

import { useState } from "react"
import { useUser } from "@/hooks/use-user"
import { Loader2 } from "lucide-react"

export function SignOutButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useUser()

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-colors"
        style={{ backgroundColor: "#EE6055" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e04d42")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EE6055")}
      >
        Uitloggen
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isLoading && setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Uitloggen</h3>
            <p className="text-gray-500 text-sm mb-6">
              Weet je zeker dat je wilt uitloggen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full font-bold text-white text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                style={{ backgroundColor: "#EE6055" }}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
