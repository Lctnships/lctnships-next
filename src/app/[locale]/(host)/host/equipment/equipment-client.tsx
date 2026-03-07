"use client"

import { useState, useRef } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"

interface Studio {
  id: string
  title: string
}

interface Equipment {
  id: string
  studio_id: string
  name: string
  description: string | null
  category: string
  price_per_day: number
  quantity: number
  is_available: boolean
  image_url: string | null
  created_at: string
  studios: { title: string } | null
}

interface EquipmentClientProps {
  studios: Studio[]
  equipment: Equipment[]
}

type ConditionType = "new" | "used" | "good"

const categories = [
  { id: "cameras", label: "Camera's", icon: "videocam" },
  { id: "lighting", label: "Belichting", icon: "light" },
  { id: "lenses", label: "Lenzen", icon: "camera" },
  { id: "grip", label: "Grip & Elektra", icon: "electrical_services" },
  { id: "audio", label: "Audio", icon: "mic" },
  { id: "monitors", label: "Monitoren", icon: "desktop_windows" },
  { id: "accessories", label: "Accessoires", icon: "handyman" },
]

function getCategoryLabel(id: string) {
  return categories.find(c => c.id === id)?.label || id
}

function getCategoryIcon(id: string) {
  return categories.find(c => c.id === id)?.icon || "inventory_2"
}

export function EquipmentClient({ studios, equipment }: EquipmentClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<"list" | "add">(equipment.length > 0 ? "list" : "add")
  const [filterCategory, setFilterCategory] = useState("")

  // Add form state
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredEquipment = filterCategory
    ? equipment.filter(e => e.category === filterCategory)
    : equipment

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden")
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) return
    setDeletingId(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Verwijderen mislukt")
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleAvailability = async (item: Equipment) => {
    try {
      const response = await fetch(`/api/equipment/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !item.is_available }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bijwerken mislukt")
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden")
    }
  }

  const resetForm = () => {
    setName("")
    setCategory("")
    setDailyPrice("")
    setCondition("new")
    setDescription("")
    setSelectedStudio("")
    setImages([])
    setError(null)
  }

  // ─── LIST VIEW ───
  if (view === "list") {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Mijn Inventaris</h1>
            <p className="text-gray-500 text-lg">
              {equipment.length} {equipment.length === 1 ? "item" : "items"} in je collectie
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setView("add") }}
            className="flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Toevoegen
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              !filterCategory ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Alles
          </button>
          {categories.map(cat => {
            const count = equipment.filter(e => e.category === cat.id).length
            if (count === 0) return null
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                  filterCategory === cat.id ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
                {cat.label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 mb-6">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Equipment Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Image / Placeholder */}
              <Link href={`/host/equipment/${item.id}`} className="block">
                <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <span className="material-symbols-outlined text-5xl">{getCategoryIcon(item.category)}</span>
                      <span className="text-xs font-medium uppercase tracking-wider">{getCategoryLabel(item.category)}</span>
                    </div>
                  )}
                  {/* Availability Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    item.is_available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {item.is_available ? "Beschikbaar" : "Niet beschikbaar"}
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="p-5">
                <Link href={`/host/equipment/${item.id}`} className="block mb-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg leading-tight hover:underline">{item.name}</h3>
                    <span className="text-lg font-black whitespace-nowrap">
                      €{item.price_per_day}<span className="text-xs text-gray-400 font-medium">/dag</span>
                    </span>
                  </div>
                </Link>

                {item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <span className="material-symbols-outlined text-sm">{getCategoryIcon(item.category)}</span>
                  <span>{getCategoryLabel(item.category)}</span>
                  <span className="mx-1">·</span>
                  <span>{item.studios?.title || "Geen studio"}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex-1 text-xs font-bold py-2 rounded-full transition-all ${
                      item.is_available
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {item.is_available ? "Deactiveren" : "Activeren"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="size-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {deletingId === item.id ? "progress_activity" : "delete"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEquipment.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4 block">inventory_2</span>
            <h3 className="text-xl font-bold mb-2">
              {filterCategory ? "Geen items in deze categorie" : "Nog geen apparatuur"}
            </h3>
            <p className="text-gray-400 mb-6">
              {filterCategory
                ? "Probeer een andere categorie of voeg nieuw materiaal toe."
                : "Voeg je eerste apparatuur toe om te beginnen met verhuren."}
            </p>
            {!filterCategory && (
              <button
                onClick={() => { resetForm(); setView("add") }}
                className="bg-black text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                Eerste Item Toevoegen
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ─── ADD VIEW ───
  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-500">
        <Link href="/host/dashboard" className="hover:text-black transition-colors">
          Host Dashboard
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <button onClick={() => setView("list")} className="hover:text-black transition-colors">
          Mijn Inventaris
        </button>
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
            <h3 className="text-xl font-bold">Materiaal Foto&apos;s</h3>
            <p className="text-sm text-gray-500">
              Upload maximaal 5 foto&apos;s in hoge resolutie van je apparatuur.
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
              className="w-full aspect-square flex flex-col items-center justify-center bg-white hover:bg-black/5 transition-all cursor-pointer group-hover:scale-[1.01] border-2 border-dashed border-black rounded-3xl"
            >
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined text-black text-4xl animate-spin">progress_activity</span>
                  <p className="text-lg font-bold mt-4">Uploaden...</p>
                </>
              ) : (
                <>
                  <div className="size-20 rounded-full bg-black/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-black text-4xl">cloud_upload</span>
                  </div>
                  <p className="text-lg font-bold mb-1">Sleep je foto&apos;s hierheen</p>
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
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-black/50 hover:text-gray-400 transition-colors cursor-pointer"
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
                  className="w-full rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all"
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
                    className="w-full appearance-none rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-black focus:border-black transition-all"
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
                      className="w-full appearance-none rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-black focus:border-black transition-all"
                    >
                      <option value="">Selecteer een studio</option>
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
                    className="w-full rounded-full border-gray-200 bg-gray-50 px-6 py-4 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all"
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
                            ? "bg-black text-white shadow-lg shadow-black/20"
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
                  className="w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all resize-none"
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
              <button
                type="button"
                onClick={() => setView("list")}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
