"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Building2, ArrowLeft, Save, Loader2, Upload, X, Star, ImagePlus, Plus } from "lucide-react"

const studioTypes = [
  { id: "Photography", icon: "photo_camera", title: "Fotostudio" },
  { id: "Video", icon: "videocam", title: "Videostudio" },
  { id: "Podcast", icon: "mic", title: "Podcast Studio" },
  { id: "Music", icon: "music_note", title: "Muziekstudio" },
  { id: "Dance", icon: "directions_run", title: "Dansstudio" },
  { id: "Creative", icon: "palette", title: "Galerie" },
]

const allAmenities = [
  "WiFi", "Lighting Equipment", "Green Screen", "Changing Room",
  "Air Conditioning", "Parking", "Kitchen", "Sound System",
  "Projector", "Whiteboard", "Coffee/Tea", "Wheelchair Accessible",
  "LED Panelen", "Ringlampen", "Softboxen", "C-Stands",
  "Audio Interface", "Monitor Speakers", "Podcast Microfoons",
  "Geluidsisolatie", "Mengtafel", "Camera Verhuur", "Statieven",
  "Gimbal", "Teleprompter", "1Gbps Glasvezel Internet",
]

interface StudioImage {
  id: string
  image_url: string
  is_cover: boolean
  order_index: number
}

interface Studio {
  id: string
  title: string
  description: string | null
  type: string
  location: string
  address: string | null
  city: string | null
  price_per_hour: number
  capacity: number | null
  size_sqm: number | null
  minimum_hours: number | null
  amenities: string[] | null
  is_published: boolean | null
  is_instant_book: boolean | null
  cancellation_policy: string | null
  studio_images: StudioImage[]
}

export function StudioEditClient({ studio }: { studio: Studio }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState(studio.title)
  const [description, setDescription] = useState(studio.description || "")
  const [type, setType] = useState(studio.type)
  const [location, setLocation] = useState(studio.location)
  const [address, setAddress] = useState(studio.address || "")
  const [city, setCity] = useState(studio.city || "")
  const [pricePerHour, setPricePerHour] = useState(studio.price_per_hour)
  const [capacity, setCapacity] = useState(studio.capacity || 0)
  const [sizeSqm, setSizeSqm] = useState(studio.size_sqm || 0)
  const [minimumHours, setMinimumHours] = useState(studio.minimum_hours || 1)
  const [amenities, setAmenities] = useState<string[]>(studio.amenities || [])
  const [isPublished, setIsPublished] = useState(studio.is_published ?? false)
  const [isInstantBook, setIsInstantBook] = useState(studio.is_instant_book ?? false)
  const [cancellationPolicy, setCancellationPolicy] = useState(studio.cancellation_policy || "flexible")

  // Photo state
  const [images, setImages] = useState<StudioImage[]>(
    [...(studio.studio_images || [])].sort((a, b) => a.order_index - b.order_index)
  )
  const [uploading, setUploading] = useState(false)
  const [customAmenity, setCustomAmenity] = useState("")

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !amenities.includes(trimmed) && !allAmenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed])
    }
    setCustomAmenity("")
  }

  const handleAmenityKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomAmenity()
    }
  }

  // Custom amenities = selected ones not in the preset list
  const customAmenities = amenities.filter((a) => !allAmenities.includes(a))

  // Photo handlers
  const handleUploadPhotos = async (files: FileList) => {
    setUploading(true)
    const newImages: StudioImage[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "studio-images")
      formData.append("folder", studio.id)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) continue
      const { url } = await res.json()

      const nextIndex = images.length + newImages.length
      const isCover = images.length === 0 && newImages.length === 0

      const { data } = await supabase
        .from("studio_images")
        .insert({
          studio_id: studio.id,
          image_url: url,
          is_cover: isCover,
          order_index: nextIndex,
        })
        .select()
        .single()

      if (data) newImages.push(data)
    }

    setImages((prev) => [...prev, ...newImages])
    setUploading(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    const img = images.find((i) => i.id === imageId)
    if (!img) return

    await supabase.from("studio_images").delete().eq("id", imageId)

    const remaining = images.filter((i) => i.id !== imageId)

    // If deleted image was cover, make first remaining image the cover
    if (img.is_cover && remaining.length > 0) {
      await supabase
        .from("studio_images")
        .update({ is_cover: true })
        .eq("id", remaining[0].id)
      remaining[0] = { ...remaining[0], is_cover: true }
    }

    setImages(remaining)
  }

  const handleSetCover = async (imageId: string) => {
    // Remove cover from all, set on selected
    await supabase
      .from("studio_images")
      .update({ is_cover: false })
      .eq("studio_id", studio.id)

    await supabase
      .from("studio_images")
      .update({ is_cover: true })
      .eq("id", imageId)

    setImages((prev) =>
      prev.map((img) => ({ ...img, is_cover: img.id === imageId }))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from("studios")
      .update({
        title,
        description,
        type,
        location,
        address,
        city,
        price_per_hour: pricePerHour,
        capacity: capacity || null,
        size_sqm: sizeSqm || null,
        minimum_hours: minimumHours || null,
        amenities,
        is_published: isPublished,
        is_instant_book: isInstantBook,
        cancellation_policy: cancellationPolicy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studio.id)

    setSaving(false)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const currentCover = images.find((img) => img.is_cover) || images[0]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/host/studios")} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Studio Bewerken</h1>
          <p className="text-muted-foreground mt-1">{studio.title}</p>
        </div>
        {currentCover ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden relative">
            <Image src={currentCover.image_url} alt={studio.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Photos */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Foto&apos;s</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploaden..." : "Foto's Toevoegen"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUploadPhotos(e.target.files)}
          />
        </div>

        {images.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center gap-3 hover:border-gray-400 transition-colors"
          >
            <ImagePlus className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500 font-medium">Klik om foto&apos;s te uploaden</p>
            <p className="text-xs text-gray-400">JPG, PNG of WebP (max 10MB)</p>
          </button>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden">
                <Image
                  src={img.image_url}
                  alt="Studio foto"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Cover badge */}
                {img.is_cover && (
                  <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" />
                    Cover
                  </div>
                )}
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!img.is_cover && (
                    <button
                      onClick={() => handleSetCover(img.id)}
                      className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors"
            >
              <ImagePlus className="h-6 w-6 text-gray-300" />
              <span className="text-xs text-gray-400">Toevoegen</span>
            </button>
          </div>
        )}
      </section>

      {/* Studio Type */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-bold">Type Studio</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {studioTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                type === t.id ? "border-black bg-black/5" : "border-transparent hover:border-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-2xl mb-2">{t.icon}</span>
              <span className="text-xs font-medium">{t.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Basic Info */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-bold">Basisinformatie</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Studionaam</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-black focus:border-black resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Capaciteit (personen)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Oppervlakte (m²)</label>
              <input
                type="number"
                value={sizeSqm}
                onChange={(e) => setSizeSqm(Number(e.target.value))}
                className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-bold">Locatie</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Adres</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Stad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Weergavenaam</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black"
                placeholder="bijv. Amsterdam Centrum"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-bold">Prijzen & Boekingsregels</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Prijs per uur</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                <input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  className="w-full border rounded-lg h-12 pl-8 pr-4 focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Minimaal aantal uren</label>
              <select
                value={minimumHours}
                onChange={(e) => setMinimumHours(Number(e.target.value))}
                className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black bg-white"
              >
                <option value={1}>1 uur</option>
                <option value={2}>2 uur</option>
                <option value={3}>3 uur</option>
                <option value={4}>4 uur (halve dag)</option>
                <option value={8}>8 uur (hele dag)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Minimale boekingsduur voor huurders</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Annuleringsbeleid</label>
            <select
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full border rounded-lg h-12 px-4 focus:ring-2 focus:ring-black focus:border-black bg-white"
            >
              <option value="flexible">Flexibel - Gratis annuleren tot 24 uur van tevoren</option>
              <option value="moderate">Gemiddeld - Gratis annuleren tot 5 dagen van tevoren</option>
              <option value="strict">Streng - 50% terugbetaling tot 7 dagen van tevoren</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="font-medium">Direct Boeken</p>
              <p className="text-sm text-muted-foreground">Gasten kunnen direct boeken zonder goedkeuring</p>
            </div>
            <button
              onClick={() => setIsInstantBook(!isInstantBook)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                isInstantBook ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                isInstantBook ? "translate-x-5" : ""
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-bold">Voorzieningen & Apparatuur</h2>
        <div className="flex flex-wrap gap-2">
          {allAmenities.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                amenities.includes(amenity)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>

        {/* Custom amenities */}
        {customAmenities.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Eigen toevoegingen</p>
            <div className="flex flex-wrap gap-2">
              {customAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-black text-white border border-black"
                >
                  {amenity}
                  <button
                    onClick={() => setAmenities((prev) => prev.filter((a) => a !== amenity))}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add custom */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={handleAmenityKeyDown}
            placeholder="Eigen voorziening toevoegen..."
            className="flex-1 border rounded-lg h-10 px-4 text-sm focus:ring-2 focus:ring-black focus:border-black"
          />
          <button
            onClick={addCustomAmenity}
            disabled={!customAmenity.trim()}
            className="h-10 px-4 rounded-lg bg-black text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Toevoegen
          </button>
        </div>
      </section>

      {/* Publishing */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Publicatiestatus</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isPublished ? "Je studio is zichtbaar voor huurders" : "Je studio is verborgen"}
            </p>
          </div>
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              isPublished ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow ${
              isPublished ? "translate-x-5" : ""
            }`} />
          </button>
        </div>
      </section>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/host/studios")}
            className="px-6 py-3 rounded-full font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Annuleren
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Opgeslagen
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !title}
              className="bg-black hover:bg-black/90 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Opslaan..." : "Wijzigingen Opslaan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
