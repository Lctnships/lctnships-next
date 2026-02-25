"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  bio?: string
  location?: string
  phone?: string
  user_type: string
  is_verified?: boolean
  response_rate?: number
  response_time?: string
}

interface EditProfileClientProps {
  profile: Profile
}

type SettingsTab = "profile" | "account" | "payouts" | "security"

export function EditProfileClient({ profile }: EditProfileClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    location: profile.location || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Alleen afbeeldingen zijn toegestaan (JPG, PNG)")
      return
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Afbeelding is te groot (max 5MB)")
      return
    }

    setIsUploading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("bucket", "images")
      formDataUpload.append("folder", "avatars")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload mislukt")
      }

      const { url } = await res.json()

      // Update avatar_url in database
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({ avatar_url: url })
        .eq("id", profile.id)

      if (error) throw error

      setAvatarUrl(url)
      toast.success("Profielfoto bijgewerkt")
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error(error.message || "Profielfoto uploaden mislukt")
    } finally {
      setIsUploading(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          location: formData.location,
          bio: formData.bio,
          phone: formData.phone,
        })
        .eq("id", profile.id)

      if (error) throw error

      toast.success("Profiel opgeslagen")
      router.push("/profile")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error(error.message || "Profiel opslaan mislukt")
    } finally {
      setIsSaving(false)
    }
  }

  const isHost = profile.user_type === "host" || profile.user_type === "both"

  const tabs = [
    { id: "profile" as const, label: "Openbaar profiel", icon: "person" },
    { id: "account" as const, label: "Account", icon: "settings" },
    ...(isHost ? [{ id: "payouts" as const, label: "Uitbetalingen", icon: "payments" }] : []),
    { id: "security" as const, label: "Beveiliging", icon: "security" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Sidebar - Navigation */}
        <aside className="w-full lg:w-64 space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-4">Instellingen</h3>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-full font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm text-gray-900 font-bold"
                    : "text-gray-500 hover:bg-white/50"
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-10">
          {activeTab === "profile" && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">Profiel bewerken</h1>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center mb-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {avatarUrl ? (
                    <div className="relative size-40">
                      <div
                        className="size-40 rounded-full bg-cover bg-center border-4 border-white shadow-lg"
                        style={{ backgroundImage: `url("${avatarUrl}")` }}
                      />
                      <div className="absolute inset-0 size-40 rounded-full bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            photo_camera
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="size-40 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 transition-all hover:bg-gray-100">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">photo_camera</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Foto wijzigen</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500 font-medium">Aanbevolen: Vierkant JPG of PNG, 800x800px</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">Volledige naam</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-primary focus:ring-0 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">Locatie</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="bijv. Amsterdam, Nederland"
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-primary focus:ring-0 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Vertel iets over jezelf en je werk..."
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-primary focus:ring-0 transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">Telefoonnummer</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+31 6 12345678"
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-primary focus:ring-0 transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-12 flex justify-end gap-4">
                <Link
                  href="/profile"
                  className="px-8 py-4 rounded-full border border-gray-200 font-bold hover:bg-gray-50 transition-all"
                >
                  Annuleren
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-12 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                >
                  {isSaving ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">Account</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">E-mailadres</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    Wijzigen
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Taal</p>
                    <p className="text-sm text-gray-500">Nederlands</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    Wijzigen
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Valuta</p>
                    <p className="text-sm text-gray-500">EUR (€)</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    Wijzigen
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-red-600">Account verwijderen</p>
                    <p className="text-sm text-red-500">Verwijder je account en alle gegevens permanent</p>
                  </div>
                  <button className="px-6 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold hover:bg-red-200 transition-all">
                    Verwijderen
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "payouts" && isHost && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">Uitbetalingen</h1>
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_balance</span>
                <h3 className="text-xl font-bold mb-2">Geen uitbetalingsmethode</h3>
                <p className="text-gray-500 mb-6">Voeg een uitbetalingsmethode toe om betalingen van je studio boekingen te ontvangen</p>
                <button className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all">
                  Uitbetalingsmethode toevoegen
                </button>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">Beveiliging</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Wachtwoord</p>
                    <p className="text-sm text-gray-500">Laatst gewijzigd 3 maanden geleden</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    Wijzigen
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Tweestapsverificatie</p>
                    <p className="text-sm text-gray-500">Voeg een extra beveiligingslaag toe</p>
                  </div>
                  <button className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-all">
                    Inschakelen
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Actieve sessies</p>
                    <p className="text-sm text-gray-500">Beheer je ingelogde apparaten</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    Beheren
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar - Live Preview */}
        <aside className="w-full lg:w-[320px] space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Live voorbeeld</h3>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg overflow-hidden">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div
                  className="size-24 rounded-full bg-cover bg-center border-4 border-gray-100 bg-gray-200"
                  style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : {}}
                >
                  {!avatarUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                    </div>
                  )}
                </div>
                {profile.is_verified && (
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
                    <span className="material-symbols-outlined text-[10px] block">verified</span>
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold">{formData.full_name || "Je naam"}</h4>
              {isHost && (
                <p className="text-xs font-medium text-primary uppercase tracking-widest mt-1">Superhost</p>
              )}
              <p className="text-sm text-gray-500 mt-3 line-clamp-2 italic">
                &ldquo;{formData.bio?.slice(0, 80) || "Je bio verschijnt hier..."}&rdquo;
              </p>
              {isHost && (
                <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Reactietijd</span>
                    <span className="font-bold">{profile.response_time || "< 1 uur"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Beoordeling</span>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-primary text-[14px]">star</span>
                      5.0
                    </div>
                  </div>
                </div>
              )}
              <button className="w-full mt-6 py-3 rounded-full bg-gray-100 text-xs font-bold pointer-events-none">
                Bekijk openbaar profiel
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary font-bold leading-relaxed">
              {isHost
                ? "Je profiel is zichtbaar voor alle leden van de lcntships community. Houd het up-to-date om vertrouwen op te bouwen met potentiële huurders."
                : "Je profiel is zichtbaar voor studio eigenaren wanneer je een boeking maakt."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
