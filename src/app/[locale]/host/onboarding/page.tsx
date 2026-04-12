"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete"

const emptyAddress: AddressData = {
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  country: "",
  formatted: "",
}

const STUDIO_TYPE_META = [
  { id: "photo", icon: "photo_camera", labelKey: "typePhoto" },
  { id: "video", icon: "videocam", labelKey: "typeVideo" },
  { id: "podcast", icon: "mic", labelKey: "typePodcast" },
  { id: "music", icon: "music_note", labelKey: "typeMusic" },
  { id: "dance", icon: "directions_run", labelKey: "typeDance" },
  { id: "art", icon: "palette", labelKey: "typeArt" },
] as const

export default function OnboardingBasicsPage() {
  const router = useRouter()
  const t = useTranslations("Onboarding")
  const [selectedType, setSelectedType] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.type || null
  })
  const [studioName, setStudioName] = useState(() => {
    if (typeof window === 'undefined') return ""
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.title || ""
  })
  const [address, setAddress] = useState<AddressData>(() => {
    if (typeof window === 'undefined') return emptyAddress
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    if (draft.address) {
      return {
        street: draft.address.street || "",
        houseNumber: draft.address.houseNumber || "",
        postalCode: draft.address.postalCode || "",
        city: draft.address.city || "",
        country: draft.address.country || "",
        formatted: draft.location || "",
        lat: draft.address.lat,
        lng: draft.address.lng,
      }
    }
    return emptyAddress
  })
  const [description, setDescription] = useState(() => {
    if (typeof window === 'undefined') return ""
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.description || ""
  })

  const handleContinue = () => {
    // Save to localStorage for now (will save to Supabase later)
    localStorage.setItem(
      "studio_draft",
      JSON.stringify({
        type: selectedType,
        title: studioName,
        location: address.formatted,
        address: {
          street: address.street,
          houseNumber: address.houseNumber,
          postalCode: address.postalCode,
          city: address.city,
          country: address.country,
          lat: address.lat,
          lng: address.lng,
        },
        description,
      })
    )
    router.push("/host/onboarding/media")
  }

  const _isAddressValid = address.city && (address.street || address.postalCode)

  return (
    <>
      {/* Header Section */}
      <header className="max-w-4xl w-full mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-black font-bold text-sm tracking-widest uppercase">{t("step1Label")}</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t("step1Title")}</h2>
          <p className="text-gray-500 text-lg">{t("step1Subtitle")}</p>
        </div>
      </header>

      {/* Form Content */}
      <section className="max-w-4xl w-full mx-auto px-12 pb-32 flex-1">
        {/* Studio Type Selection */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t("studioTypeTitle")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STUDIO_TYPE_META.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`group flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl transition-all shadow-sm ${
                  selectedType === type.id
                    ? "border-black"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    selectedType === type.id
                      ? "bg-black/10 text-black"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{type.icon}</span>
                </div>
                <span
                  className={`font-bold text-sm ${
                    selectedType === type.id ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {t(type.labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">{t("studioNameLabel")}</label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl h-14 px-5 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all shadow-sm placeholder:text-gray-400"
              placeholder={t("studioNamePlaceholder")}
            />
            <p className="text-xs text-gray-500 px-1 mt-1">{t("studioNameHint")}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">{t("locationLabel")}</label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              placeholder={t("locationPlaceholder")}
            />
            <p className="text-xs text-gray-500 px-1 mt-1">{t("locationHint")}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">{t("descriptionLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white border-gray-200 rounded-xl p-5 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all shadow-sm placeholder:text-gray-400 resize-none"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
        </div>

        {/* Studio Preview Card */}
        <div className="mt-16 p-8 bg-black/5 rounded-xl border border-black/10 flex items-start gap-6">
          <div className="w-32 h-32 rounded-lg bg-gray-200 shrink-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-white/50">image</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-black mb-1">
              {t("previewLabel")}
            </span>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {studioName || <span className="italic text-gray-400">{t("previewNamePlaceholder")}</span>}
            </h4>
            {address.city && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{address.city}</span>
              </div>
            )}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">{t("previewVisibility")}</p>
          </div>
        </div>
      </section>

      {/* Sticky Footer Action */}
      <footer className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/host/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              {t("cancel")}
            </Link>
            <Link
              href="/host/dashboard"
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t("fillLater")}
              <span className="material-symbols-outlined text-base">skip_next</span>
            </Link>
          </div>
          <button
            onClick={handleContinue}
            disabled={!selectedType || !studioName}
            className="bg-black hover:bg-black/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("continueToMedia")}
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  )
}
