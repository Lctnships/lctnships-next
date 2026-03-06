"use client"

import { useRef, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link, useRouter, usePathname } from "@/i18n/routing"
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
  const t = useTranslations("EditProfile")
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
      toast.error(t("errorOnlyImages"))
      return
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("errorImageTooLarge"))
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
        throw new Error(data.error || t("errorUploadFailed"))
      }

      const { url } = await res.json()

      // Update avatar_url via API route (bypasses RLS)
      const res2 = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url }),
      })
      if (!res2.ok) {
        const errData = await res2.json()
        throw new Error(errData.error || "Failed to update avatar")
      }

      setAvatarUrl(url)
      toast.success(t("successAvatarUpdated"))
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error(error.message || t("errorAvatarUploadFailed"))
    } finally {
      setIsUploading(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          location: formData.location,
          bio: formData.bio,
          phone: formData.phone,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Save failed")
      }

      toast.success(t("successProfileSaved"))
      router.push("/profile")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error(error.message || t("errorProfileSaveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const locale = useLocale()
  const pathname = usePathname()
  const isHost = profile.user_type === "host" || profile.user_type === "both"
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("preferred_currency") || "EUR"
    return "EUR"
  })

  const languageOptions = [
    { code: "nl" as const, label: "Nederlands" },
    { code: "en" as const, label: "English" },
    { code: "es" as const, label: "Espanol" },
  ]

  const currencyOptions = [
    { code: "EUR", symbol: "\u20ac", label: "Euro" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "GBP", symbol: "\u00a3", label: "British Pound" },
  ]

  const handleSelectLanguage = (langCode: "nl" | "en" | "es") => {
    const label = languageOptions.find(l => l.code === langCode)?.label
    router.replace(pathname, { locale: langCode })
    setShowLanguageMenu(false)
    toast.success(`Taal gewijzigd naar ${label}`)
  }

  const handleSelectCurrency = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    localStorage.setItem("preferred_currency", currencyCode)
    setShowCurrencyMenu(false)
    const label = currencyOptions.find(c => c.code === currencyCode)?.label
    toast.success(`Valuta gewijzigd naar ${label}`)
  }

  const handleDeleteAccount = async () => {
    if (!confirm(t("accountDeleteConfirm") || "Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      toast.success("Account uitgelogd. Neem contact op met support om je account permanent te verwijderen.")
    } catch {
      toast.error("Er ging iets mis")
    }
  }

  const tabs = [
    { id: "profile" as const, label: t("tabPublicProfile"), icon: "person" },
    { id: "account" as const, label: t("tabAccount"), icon: "settings" },
    ...(isHost ? [{ id: "payouts" as const, label: t("tabPayouts"), icon: "payments" }] : []),
    { id: "security" as const, label: t("tabSecurity"), icon: "security" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Sidebar - Navigation */}
        <aside className="w-full lg:w-64 space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-4">{t("settingsLabel")}</h3>
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
              <h1 className="text-3xl font-bold mb-8">{t("heading")}</h1>

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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t("changePhoto")}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500 font-medium">{t("photoRecommendation")}</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">{t("fieldFullName")}</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-black focus:ring-0 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">{t("fieldLocation")}</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t("fieldLocationPlaceholder")}
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-black focus:ring-0 transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">{t("fieldBio")}</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t("fieldBioPlaceholder")}
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-black focus:ring-0 transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold ml-4">{t("fieldPhone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+31 6 12345678"
                    className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-transparent focus:border-black focus:ring-0 transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-12 flex justify-end gap-4">
                <Link
                  href="/profile"
                  className="px-8 py-4 rounded-full border border-gray-200 font-bold hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-12 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                >
                  {isSaving ? t("saving") : t("save")}
                </button>
              </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">{t("accountHeading")}</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{t("accountEmail")}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => toast.info("E-mailadres wijzigen is momenteel niet beschikbaar. Neem contact op met support.")}
                    className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all"
                  >
                    {t("accountChange")}
                  </button>
                </div>
                <div className="relative p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{t("accountLanguage")}</p>
                      <p className="text-sm text-gray-500">{{ nl: "Nederlands", en: "English", es: "Espanol" }[locale] || locale}</p>
                    </div>
                    <button
                      onClick={() => { setShowLanguageMenu(!showLanguageMenu); setShowCurrencyMenu(false) }}
                      className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all"
                    >
                      {t("accountChange")}
                    </button>
                  </div>
                  {showLanguageMenu && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {languageOptions.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleSelectLanguage(lang.code)}
                          className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            locale === lang.code ? "font-bold bg-gray-50" : ""
                          }`}
                        >
                          {lang.label}
                          {locale === lang.code && (
                            <span className="material-symbols-outlined text-black text-lg">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{t("accountCurrency")}</p>
                      <p className="text-sm text-gray-500">{selectedCurrency} ({currencyOptions.find(c => c.code === selectedCurrency)?.symbol})</p>
                    </div>
                    <button
                      onClick={() => { setShowCurrencyMenu(!showCurrencyMenu); setShowLanguageMenu(false) }}
                      className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all"
                    >
                      {t("accountChange")}
                    </button>
                  </div>
                  {showCurrencyMenu && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {currencyOptions.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleSelectCurrency(currency.code)}
                          className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            selectedCurrency === currency.code ? "font-bold bg-gray-50" : ""
                          }`}
                        >
                          {currency.symbol} {currency.label} ({currency.code})
                          {selectedCurrency === currency.code && (
                            <span className="material-symbols-outlined text-black text-lg">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-red-600">{t("accountDeleteAccount")}</p>
                    <p className="text-sm text-red-500">{t("accountDeleteDesc")}</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold hover:bg-red-200 transition-all"
                  >
                    {t("accountDelete")}
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "payouts" && isHost && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">{t("payoutsHeading")}</h1>
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">account_balance</span>
                <h3 className="text-xl font-bold mb-2">{t("payoutsNoMethod")}</h3>
                <p className="text-gray-500 mb-6">{t("payoutsNoMethodDesc")}</p>
                <button className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all">
                  {t("payoutsAddMethod")}
                </button>
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
              <h1 className="text-3xl font-bold mb-8">{t("securityHeading")}</h1>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{t("securityPassword")}</p>
                    <p className="text-sm text-gray-500">{t("securityLastChanged")}</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    {t("accountChange")}
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{t("securityTwoFactor")}</p>
                    <p className="text-sm text-gray-500">{t("securityTwoFactorDesc")}</p>
                  </div>
                  <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all">
                    {t("securityEnable")}
                  </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{t("securityActiveSessions")}</p>
                    <p className="text-sm text-gray-500">{t("securityActiveSessionsDesc")}</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-white transition-all">
                    {t("securityManage")}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar - Live Preview */}
        <aside className="w-full lg:w-[320px] space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">{t("previewHeading")}</h3>
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
                  <div className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full border-2 border-white">
                    <span className="material-symbols-outlined text-[10px] block">verified</span>
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold">{formData.full_name || t("previewYourName")}</h4>
              {isHost && (
                <p className="text-xs font-medium text-black uppercase tracking-widest mt-1">{t("previewSuperhost")}</p>
              )}
              <p className="text-sm text-gray-500 mt-3 line-clamp-2 italic">
                &ldquo;{formData.bio?.slice(0, 80) || t("previewBioPlaceholder")}&rdquo;
              </p>
              {isHost && (
                <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t("previewResponseTime")}</span>
                    <span className="font-bold">{profile.response_time || t("previewLessThanOneHour")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t("previewRating")}</span>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-black text-[14px]">star</span>
                      5.0
                    </div>
                  </div>
                </div>
              )}
              <Link
                href="/profile"
                className="w-full mt-6 py-3 rounded-full bg-gray-100 text-xs font-bold text-center block hover:bg-gray-200 transition-all"
              >
                {t("previewViewPublicProfile")}
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gray-100 border border-gray-100">
            <p className="text-xs text-black font-bold leading-relaxed">
              {isHost
                ? t("previewHostVisibilityNote")
                : t("previewRenterVisibilityNote")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
