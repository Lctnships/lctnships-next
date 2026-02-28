"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"

const equipmentCategories = [
  {
    title: "Verlichting & Grip",
    items: [
      "Continue Verlichting",
      "Flitssets",
      "Cyclorama Wand",
      "C-Stands",
      "Softboxen",
      "LED Panelen",
      "Ringlampen",
    ],
  },
  {
    title: "Audio & Tech",
    items: [
      "Audio Interface",
      "Monitor Speakers",
      "Podcast Microfoons",
      "1Gbps Glasvezel Internet",
      "Geluidsisolatie",
      "Mengtafel",
    ],
  },
  {
    title: "Camera & Video",
    items: [
      "Camera Verhuur",
      "Statieven",
      "Gimbals",
      "Green Screen",
      "Teleprompter",
      "Monitor",
    ],
  },
  {
    title: "Voorzieningen",
    items: [
      "Keuken Toegang",
      "Kleedkamer",
      "WiFi",
      "Airconditioning",
      "Parkeren",
      "Rolstoeltoegankelijk",
    ],
  },
]

export default function OnboardingEquipmentPage() {
  const router = useRouter()
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    "Continue Verlichting",
    "Cyclorama Wand",
    "Monitor Speakers",
  ])

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const handleContinue = () => {
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    localStorage.setItem("studio_draft", JSON.stringify({ ...draft, equipment: selectedEquipment }))
    router.push("/host/onboarding/pricing")
  }

  return (
    <>
      {/* Header Section */}
      <header className="max-w-4xl w-full mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-primary font-bold text-sm tracking-widest uppercase">
            Stap 3: Apparatuur
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Wat is inbegrepen?
          </h2>
          <p className="text-gray-500 text-lg">
            Selecteer alle apparatuur en voorzieningen in je studio.
          </p>
        </div>
      </header>

      {/* Form Content */}
      <section className="max-w-4xl w-full mx-auto px-12 pb-32 flex-1">
        <div className="space-y-10">
          {equipmentCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                {category.title}
              </h4>
              <div className="flex flex-wrap gap-3">
                {category.items.map((item) => {
                  const isSelected = selectedEquipment.includes(item)
                  return (
                    <button
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-700 hover:border-primary"
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Count */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Geselecteerde Apparatuur</h3>
              <p className="text-gray-500 text-sm">
                {selectedEquipment.length} items worden getoond in je advertentie
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-md">
              {selectedEquipment.slice(0, 5).map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full"
                >
                  {item}
                </span>
              ))}
              {selectedEquipment.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  +{selectedEquipment.length - 5} meer
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Footer Action */}
      <footer className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <Link
            href="/host/onboarding/media"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Terug
          </Link>
          <button
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-3"
          >
            Verder naar Prijsstelling
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  )
}
