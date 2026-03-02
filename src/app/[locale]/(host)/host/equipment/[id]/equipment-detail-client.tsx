"use client"

import { useState, useRef } from "react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"

interface Studio {
  id: string
  title: string
}

interface EquipmentItem {
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
  updated_at: string
  studios: { id: string; title: string; host_id: string } | null
}

interface Props {
  item: EquipmentItem
  studios: Studio[]
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

export function EquipmentDetailClient({ item, studios }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [dailyPrice, setDailyPrice] = useState(String(item.price_per_day))
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [condition, setCondition] = useState<ConditionType>("good")
  const [description, setDescription] = useState(item.description || "")
  const [selectedStudio, setSelectedStudio] = useState(item.studio_id)
  const [isAvailable, setIsAvailable] = useState(item.is_available)
  const [imageUrl, setImageUrl] = useState(item.image_url)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", files[0])
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
      setImageUrl(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (!name || !category || !dailyPrice) {
      setError("Vul alle verplichte velden in")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/equipment/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          category,
          studio_id: selectedStudio,
          price_per_day: parseFloat(dailyPrice),
          quantity: parseInt(quantity) || 1,
          is_available: isAvailable,
          image_url: imageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Opslaan mislukt")
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je dit item permanent wilt verwijderen?")) return
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/equipment/${item.id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Verwijderen mislukt")
      }
      router.push("/host/equipment")
    } catch (err: any) {
      setError(err.message)
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-gray-500">
        <Link href="/host/dashboard" className="hover:text-black transition-colors">
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/host/equipment" className="hover:text-black transition-colors">
          Inventaris
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-900 truncate max-w-[200px]">{item.name}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-12 items-start">
        {/* Left: Image Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black/40 transition-all cursor-pointer relative group"
          >
            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl animate-spin text-black">progress_activity</span>
                <p className="text-sm font-bold mt-3">Uploaden...</p>
              </div>
            ) : imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                    photo_camera
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <span className="material-symbols-outlined text-6xl mb-3">{getCategoryIcon(category)}</span>
                <p className="text-sm font-bold">Klik om foto te uploaden</p>
              </div>
            )}
          </div>

          {imageUrl && (
            <button
              onClick={() => setImageUrl(null)}
              className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Foto verwijderen
            </button>
          )}

          {/* Quick Info Card */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className={`text-sm font-bold ${isAvailable ? "text-green-600" : "text-gray-400"}`}>
                {isAvailable ? "Beschikbaar" : "Niet beschikbaar"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Categorie</span>
              <span className="text-sm font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">{getCategoryIcon(category)}</span>
                {getCategoryLabel(category)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Studio</span>
              <span className="text-sm font-bold">{studios.find(s => s.id === selectedStudio)?.title || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Toegevoegd</span>
              <span className="text-sm font-bold">
                {new Date(item.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Edit Form (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight">Bewerk Apparatuur</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isAvailable ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <div className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${
                    isAvailable ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
                <span className="text-sm font-medium text-gray-500">
                  {isAvailable ? "Actief" : "Inactief"}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                  Naam
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all"
                  placeholder="bijv. ARRI Alexa Mini LF"
                />
              </div>

              {/* Category + Studio */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                    Categorie
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xl">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                    Studio
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStudio}
                      onChange={(e) => setSelectedStudio(e.target.value)}
                      className="w-full appearance-none rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black transition-all"
                    >
                      {studios.map((studio) => (
                        <option key={studio.id} value={studio.id}>{studio.title}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xl">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Price + Quantity + Condition */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                    Dagprijs (€)
                  </label>
                  <input
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                    Aantal
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black transition-all"
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                    Staat
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {(["new", "used", "good"] as ConditionType[]).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`flex-1 text-xs font-bold py-3 rounded-lg transition-all ${
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

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
                  Beschrijving
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-5 py-3.5 focus:ring-black focus:border-black placeholder:text-gray-300 transition-all resize-none"
                  placeholder="Vermeld accessoires, specificaties of gebruiksvereisten..."
                />
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                <span className="material-symbols-outlined">error</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-medium">Wijzigingen opgeslagen!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:flex-1 bg-black text-white font-bold py-4 px-8 rounded-full hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">save</span>
                    Wijzigingen Opslaan
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Verwijderen...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">delete</span>
                    Verwijderen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
