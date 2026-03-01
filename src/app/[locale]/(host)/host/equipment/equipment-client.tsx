"use client"

import { useState, useRef } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"

interface Studio {
  id: string
  title: string
}

interface EquipmentClientProps {
  studios: Studio[]
}

type ConditionType = "new" | "used" | "good"

export function EquipmentClient({ studios }: EquipmentClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [dailyPrice, setDailyPrice] = useState("")
  const [condition, setCondition] = useState<ConditionType>("new")
  const [description, setDescription] = useState("")
  const [selectedStudio, setSelectedStudio] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: "cameras", label: "Camera's" },
    { id: "lighting", label: "Belichting" },
    { id: "lenses", label: "Lenzen" },
    { id: "grip", label: "Grip & Elektra" },
    { id: "audio", label: "Audio Apparatuur" },
    { id: "monitors", label: "Monitoren" },
    { id: "accessories", label: "Accessoires" },
  ]

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length + files.length > 5) {
      setError("Maximaal 5 foto's toegestaan")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "equipment")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Upload mislukt")
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedUrls])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !category || !dailyPrice) {
      setError("Vul alle verplichte velden in")
      return
    }

    if (!selectedStudio) {
      setError("Selecteer een studio")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studio_id: selectedStudio,
          name,
          description,
          category,
          price_per_day: parseFloat(dailyPrice),
          quantity: 1,
          is_available: true,
          image_url: images[0] || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Apparatuur toevoegen mislukt")
      }

      router.push("/host/equipment")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-500">
        <Link href="/host/dashboard" className="hover:text-primary transition-colors">
          Host Dashboard
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/host/equipment" className="hover:text-primary transition-colors">
          Mijn Inventaris
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-900">Nieuw Materiaal Toevoegen</span>
      </nav>

      {/* Page Heading */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Toevoegen aan Inventaris</h1>
        <p className="text-gray-500 text-lg">
          Plaats je professionele apparatuur voor de creatieve community.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Upload Area */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Materiaal Foto's</h3>
            <p className="text-sm text-gray-500">
              Upload maximaal 5 foto's in hoge resolutie van je apparatuur.
            </p>
          </div>

          {/* Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className="relative group">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square flex flex-col items-center justify-center bg-white hover:bg-primary/5 transition-all cursor-pointer group-hover:scale-[1.01] border-2 border-dashed border-primary"
              style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
            >
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                  <p className="text-lg font-bold mt-4">Uploaden...</p>
                </>
              ) : (
                <>
                  <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                  </div>
                  <p className="text-lg font-bold mb-1">Sleep je foto's hierheen</p>
                  <p className="text-sm text-gray-400">of klik om bestanden te kiezen</p>
                </>
              )}
            </div>
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {images.map((url, index) => (
              <div key={index} className="aspect-square rounded-2xl overflow-hidden relative group">
                <Image src={url} alt={`Equipment ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary/50 hover:text-primary/50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                  Naam Apparatuur
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-primary focus:border-primary placeholder:text-gray-300 transition-all"
                  placeholder="bijv. ARRI Alexa Mini LF"
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                  Categorie
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="">Selecteer een categorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Studio Assignment */}
              {studios.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                    Toewijzen aan Studio
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStudio}
                      onChange={(e) => setSelectedStudio(e.target.value)}
                      className="w-full appearance-none rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="">Selecteer een studio (optioneel)</option>
                      {studios.map((studio) => (
                        <option key={studio.id} value={studio.id}>
                          {studio.title}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      expand_more
                    </span>
                  </div>
                </div>
              )}

              {/* Price & Condition Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                    Dagprijs (€)
                  </label>
                  <input
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="w-full rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-primary focus:border-primary placeholder:text-gray-300 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                    Staat
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200">
                    {(["new", "used", "good"] as ConditionType[]).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`flex-1 text-xs font-bold py-3 rounded-full transition-all ${
                          condition === cond
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        {cond === "new" ? "Nieuw" : cond === "used" ? "Gebruikt" : "Goed"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-2">
                  Beschrijving
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 focus:ring-primary focus:border-primary placeholder:text-gray-300 transition-all resize-none"
                  placeholder="Vermeld accessoires, specificaties of gebruiksvereisten..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto min-w-[280px] bg-gray-900 text-white font-bold text-lg py-5 px-10 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span>Toevoegen...</span>
                  </>
                ) : (
                  <>
                    <span>Toevoegen aan Inventaris</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
              <Link
                href="/host/equipment"
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold"
              >
                Annuleren
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
