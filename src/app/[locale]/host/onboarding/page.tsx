"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete"

const emptyAddress: AddressData = {
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  country: "",
  formatted: "",
}

const studioTypes = [
  { id: "photo", icon: "photo_camera", title: "Fotostudio" },
  { id: "video", icon: "videocam", title: "Videostudio" },
  { id: "podcast", icon: "mic", title: "Podcast Studio" },
  { id: "music", icon: "music_note", title: "Muziekstudio" },
  { id: "dance", icon: "fitness_center", title: "Dansstudio" },
  { id: "art", icon: "palette", title: "Galerie" },
]

export default function OnboardingBasicsPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [studioName, setStudioName] = useState("")
  const [address, setAddress] = useState<AddressData>(emptyAddress)
  const [description, setDescription] = useState("")

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

  const isAddressValid = address.street && address.city

  return (
    <>
      {/* Header Section */}
      <header className="max-w-4xl w-full mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-primary font-bold text-sm tracking-widest uppercase">Stap 1: De Basis</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Vertel ons over je ruimte</h2>
          <p className="text-gray-500 text-lg">Elke goede listing begint met een duidelijke identiteit. Laten we die van jou bepalen.</p>
        </div>
      </header>

      {/* Form Content */}
      <section className="max-w-4xl w-full mx-auto px-12 pb-32 flex-1">
        {/* Studio Type Selection */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Wat voor type studio is het?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {studioTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`group flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl transition-all shadow-sm ${
                  selectedType === type.id
                    ? "border-primary"
                    : "border-transparent hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    selectedType === type.id
                      ? "bg-primary/10 text-primary"
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
                  {type.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">Studionaam</label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full bg-white border-gray-200 rounded-xl h-14 px-5 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm placeholder:text-gray-400"
              placeholder="bijv. Skyline Creative"
            />
            <p className="text-xs text-gray-500 px-1 mt-1">
              Kies een pakkende naam die het karakter van je ruimte weerspiegelt.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">Locatie</label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              placeholder="Zoek je adres..."
            />
            <p className="text-xs text-gray-500 px-1 mt-1">
              Je exacte adres wordt pas getoond na een boeking.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-900 px-1">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white border-gray-200 rounded-xl p-5 text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm placeholder:text-gray-400 resize-none"
              placeholder="Beschrijf wat jouw studio bijzonder maakt..."
            />
          </div>
        </div>

        {/* Studio Preview Card */}
        <div className="mt-16 p-8 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-6">
          <div className="w-32 h-32 rounded-lg bg-gray-200 shrink-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-white/50">image</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              Voorbeeld
            </span>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {studioName || <span className="italic text-gray-400">De naam van je studio...</span>}
            </h4>
            {address.city && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{address.city}</span>
              </div>
            )}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Je studio wordt zichtbaar voor duizenden creators zodra je deze 5 stappen hebt voltooid.
              Je kunt deze gegevens later altijd wijzigen.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Footer Action */}
      <footer className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <Link
            href="/host/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Annuleren
          </Link>
          <button
            onClick={handleContinue}
            disabled={!selectedType || !studioName || !isAddressValid}
            className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verder naar Media
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  )
}
