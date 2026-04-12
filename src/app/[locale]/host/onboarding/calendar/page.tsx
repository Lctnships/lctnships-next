"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const daysOfWeek = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"]

function CalendarPageContent() {
  const router = useRouter()
  const t = useTranslations("Onboarding")
  const searchParams = useSearchParams()
  const [availableDays, setAvailableDays] = useState(() => {
    if (typeof window === 'undefined') return [1, 2, 3, 4]
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.available_days || [1, 2, 3, 4]
  })
  const [minDuration, setMinDuration] = useState(() => {
    if (typeof window === 'undefined') return "2"
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.minimum_hours ? String(draft.minimum_hours) : "2"
  })
  const [prepTime, setPrepTime] = useState(() => {
    if (typeof window === 'undefined') return "30"
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.prep_time_minutes ? String(draft.prep_time_minutes) : "30"
  })
  const [bookingNotice, setBookingNotice] = useState(() => {
    if (typeof window === 'undefined') return "24"
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.booking_notice_hours ? String(draft.booking_notice_hours) : "24"
  })
  const [instantBook, setInstantBook] = useState(() => {
    if (typeof window === 'undefined') return true
    const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
    return draft.is_instant_book !== undefined ? draft.is_instant_book : true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasAutoPublished = useRef(false)

  const toggleDay = (index: number) => {
    setAvailableDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]
    )
  }

  const handlePublish = useCallback(async () => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Save calendar settings to draft before checking login
      const currentDraft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
      const updatedDraft = {
        ...currentDraft,
        available_days: availableDays,
        minimum_hours: parseInt(minDuration),
        prep_time_minutes: parseInt(prepTime),
        booking_notice_hours: parseInt(bookingNotice),
        is_instant_book: instantBook,
      }
      localStorage.setItem("studio_draft", JSON.stringify(updatedDraft))

      if (!user) {
        toast.info(t("loginToPublish"), {
          description: t("progressSaved")
        })
        router.push("/login?redirect=/host/onboarding/calendar&publish=true")
        return
      }

      const draft = updatedDraft

      // Map draft data to actual database columns
      const studioData = {
        owner_id: user.id,
        host_id: user.id,
        title: draft.title || "Untitled Studio",
        description: draft.description || "",
        type: draft.type || "photo",
        location: draft.location || "",
        address: draft.address
          ? `${draft.address.street || ""} ${draft.address.houseNumber || ""}`.trim()
          : "",
        city: draft.address?.city || "",
        country: draft.address?.country || "Netherlands",
        latitude: draft.address?.lat || null,
        longitude: draft.address?.lng || null,
        price_per_hour: draft.price_per_hour || 45,
        images: draft.images || [],
        amenities: draft.equipment || [],
        minimum_hours: parseInt(minDuration) || 1,
        is_instant_book: instantBook,
        status: "pending_review",
        is_published: false,
      }

      const { data, error } = await supabase
        .from("studios")
        .insert(studioData)
        .select()
        .single()

      if (error) {
        console.error("Error creating studio:", error)
        toast.error(t("createFailed"), { description: error.message })
        setIsSubmitting(false)
        return
      }

      // Clear draft
      localStorage.removeItem("studio_draft")

      toast.success(t("submitted"))
      router.push(`/host/onboarding/success?id=${data.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error(t("somethingWrong"))
      setIsSubmitting(false)
    }
  }, [availableDays, minDuration, prepTime, bookingNotice, instantBook, router])

  // Auto-publish after login redirect — intentionally triggers state update
  const shouldPublish = searchParams.get("publish") === "true"
  useEffect(() => {
    if (shouldPublish && !hasAutoPublished.current) {
      hasAutoPublished.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: auto-publish triggers loading state
      handlePublish()
    }
  }, [shouldPublish, handlePublish])

  return (
    <>
      {/* Header Section */}
      <header className="max-w-5xl w-full mx-auto px-12 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <p className="text-primary font-bold text-sm tracking-widest uppercase">
            {t("step5Label")}
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("step5Title")}
          </h2>
          <p className="text-gray-500 text-lg">
            {t("step5Subtitle")}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-5xl w-full mx-auto px-12 pb-32 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Weekly Schedule */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold">Weekschema</h3>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                    CET
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-500 text-sm mb-4">
                  Selecteer op welke dagen je studio beschikbaar is voor boekingen:
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => {
                    const isAvailable = availableDays.includes(index)
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(index)}
                        className={`py-4 rounded-xl font-bold text-sm transition-all ${
                          isAvailable
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Calendar Sync Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Kalender Synchronisatie</h3>
              <p className="text-sm text-gray-500 mb-6">
                Verbind je externe kalenders om drukke dagen automatisch te blokkeren.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                  <span className="material-symbols-outlined text-red-500">event</span>
                  <span className="text-sm font-semibold">Google Calendar</span>
                </button>
                <button className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                  <span className="material-symbols-outlined text-blue-400">calendar_month</span>
                  <span className="text-sm font-semibold">Outlook</span>
                </button>
                <button className="flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all">
                  <span className="material-symbols-outlined text-gray-500">calendar_today</span>
                  <span className="text-sm font-semibold">iCal Sync</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Settings Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">settings</span>
                <h3 className="text-lg font-bold">Snelle Instellingen</h3>
              </div>
              <div className="flex flex-col gap-6">
                {/* Min Duration */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">Minimale Boekingsduur</label>
                  <select
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    className="w-full h-12 px-4 rounded-full border-gray-200 focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="1">1 Uur</option>
                    <option value="2">2 Uur</option>
                    <option value="4">4 Uur (Halve Dag)</option>
                    <option value="8">8 Uur (Hele Dag)</option>
                  </select>
                </div>

                {/* Prep Time */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">Voorbereidingstijd</label>
                  <p className="text-xs text-gray-500 mb-1">
                    Tijd tussen sessies voor schoonmaak & opbouw.
                  </p>
                  <select
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full h-12 px-4 rounded-full border-gray-200 focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="0">Geen Buffer</option>
                    <option value="15">15 Minuten</option>
                    <option value="30">30 Minuten</option>
                    <option value="60">1 Uur</option>
                  </select>
                </div>

                {/* Notice Period */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">Boekingsmelding</label>
                  <select
                    value={bookingNotice}
                    onChange={(e) => setBookingNotice(e.target.value)}
                    className="w-full h-12 px-4 rounded-full border-gray-200 focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="0">Dezelfde dag</option>
                    <option value="24">24 uur van tevoren</option>
                    <option value="48">48 uur van tevoren</option>
                    <option value="168">1 week van tevoren</option>
                  </select>
                </div>

                <hr className="border-t border-gray-100 my-2" />

                {/* Instant Book Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Direct Boeken</span>
                    <span className="text-xs text-gray-500">
                      Sta gebruikers toe te boeken zonder goedkeuring
                    </span>
                  </div>
                  <button
                    onClick={() => setInstantBook(!instantBook)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      instantBook ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        instantBook ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Footer Action */}
      <footer className="fixed bottom-0 right-0 left-80 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <Link
            href="/host/onboarding/pricing"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Terug
          </Link>
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Indienen...
              </>
            ) : (
              <>
                Studio Indienen
                <span className="material-symbols-outlined text-xl">send</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </>
  )
}

export default function OnboardingCalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    }>
      <CalendarPageContent />
    </Suspense>
  )
}
