"use client"

import { useState } from "react"
import Link from "next/link"

interface CookiePreferences {
  essential: boolean
  functional: boolean
  statistics: boolean
  marketing: boolean
}

interface CookieConsentProps {
  onAcceptAll?: () => void
  onSavePreferences?: (preferences: CookiePreferences) => void
}

export function CookieConsent({ onAcceptAll, onSavePreferences }: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const consent = localStorage.getItem("cookie-consent")
    return !consent
  })
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    statistics: false,
    marketing: false,
  })

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      statistics: true,
      marketing: true,
    }
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted))
    setIsOpen(false)
    onAcceptAll?.()
  }

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences))
    setIsOpen(false)
    onSavePreferences?.(preferences)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return // Can't toggle essential
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-[720px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 pt-10 pb-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-gray-100 text-black">
              <span className="material-symbols-outlined text-3xl">cookie</span>
            </div>
          </div>
          <h1 className="text-[#0d121b] text-center text-[32px] font-extrabold leading-tight tracking-tight mb-3">
            Cookie-instellingen
          </h1>
          <p className="text-gray-500 text-center text-base font-normal max-w-lg mx-auto leading-relaxed">
            Bij lctnships respecteren we je privacy. Beheer hier je voorkeuren voor een optimale
            ervaring in onze creatieve community.
          </p>
        </div>

        {/* Cookie Options */}
        <div className="px-10 py-2 overflow-y-auto flex-1">
          {/* Essential - Locked */}
          <div className="flex items-center gap-6 py-5 border-b border-gray-100">
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[#0d121b] text-lg font-semibold leading-normal">Noodzakelijk</p>
                <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  Verplicht
                </span>
              </div>
              <p className="text-gray-500 text-sm font-normal leading-relaxed mt-1">
                Deze cookies zijn essentieel voor de werking van de website en kunnen niet worden
                uitgeschakeld. Ze zorgen voor basisfuncties zoals paginanavigatie en toegang tot
                beveiligde gebieden.
              </p>
            </div>
            <div className="shrink-0">
              <label className="relative flex h-[32px] w-[56px] cursor-not-allowed items-center rounded-full bg-black p-1 justify-end opacity-50">
                <div className="h-full aspect-square rounded-full bg-white shadow-sm" />
              </label>
            </div>
          </div>

          {/* Functional */}
          <CookieToggle
            title="Functioneel"
            description="Maakt extra functies mogelijk zoals het onthouden van voorkeuren, taalinstellingen en inlogstatus voor een vlottere ervaring."
            enabled={preferences.functional}
            onToggle={() => togglePreference("functional")}
          />

          {/* Statistics */}
          <CookieToggle
            title="Statistieken"
            description="Helpt ons te begrijpen hoe bezoekers de website gebruiken. We verzamelen anonieme gegevens om onze service en studio-aanbod te verbeteren."
            enabled={preferences.statistics}
            onToggle={() => togglePreference("statistics")}
          />

          {/* Marketing */}
          <CookieToggle
            title="Marketing"
            description="Wordt gebruikt om bezoekers te volgen wanneer ze verschillende websites bezoeken. Het doel is om advertenties te tonen die relevant zijn voor de individuele gebruiker."
            enabled={preferences.marketing}
            onToggle={() => togglePreference("marketing")}
            noBorder
          />
        </div>

        {/* Footer */}
        <div className="px-10 pb-10 pt-6 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSavePreferences}
            className="w-full sm:flex-1 h-14 bg-white border border-gray-200 rounded-full text-[#0d121b] font-bold text-base hover:bg-gray-50 transition-colors"
          >
            Opslaan voorkeuren
          </button>
          <button
            onClick={handleAcceptAll}
            className="w-full sm:flex-1 h-14 bg-[#0d121b] text-white rounded-full font-bold text-base hover:opacity-90 transition-opacity"
          >
            Accepteer alle cookies
          </button>
        </div>

        {/* Policy Link */}
        <div className="pb-6 text-center">
          <Link
            href="/cookies"
            className="text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors uppercase tracking-widest font-semibold"
          >
            Lees ons volledige Cookiebeleid
          </Link>
        </div>
      </div>
    </div>
  )
}

interface CookieToggleProps {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  noBorder?: boolean
}

function CookieToggle({ title, description, enabled, onToggle, noBorder }: CookieToggleProps) {
  return (
    <div className={`flex items-center gap-6 py-5 ${noBorder ? "" : "border-b border-gray-100"}`}>
      <div className="flex flex-col flex-1">
        <p className="text-[#0d121b] text-lg font-semibold leading-normal">{title}</p>
        <p className="text-gray-500 text-sm font-normal leading-relaxed mt-1">{description}</p>
      </div>
      <div className="shrink-0">
        <button
          onClick={onToggle}
          className={`relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full p-1 transition-all duration-300 ${
            enabled ? "bg-black justify-end" : "bg-[#e7ebf3] justify-start"
          }`}
        >
          <div
            className="h-full aspect-square rounded-full bg-white"
            style={{ boxShadow: "rgba(0, 0, 0, 0.15) 0px 3px 8px" }}
          />
        </button>
      </div>
    </div>
  )
}
