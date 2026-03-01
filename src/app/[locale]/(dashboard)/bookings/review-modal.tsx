"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

interface Booking {
  id: string
  booking_number: string
  start_datetime: string
  studio: {
    id: string
    title: string
    city?: string
    studio_images?: { image_url: string; is_cover: boolean }[]
  }
}

interface ReviewModalProps {
  booking: Booking
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const t = useTranslations("Review")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverImage = booking.studio.studio_images?.find((img) => img.is_cover) || booking.studio.studio_images?.[0]

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          studio_id: booking.studio.id,
          rating,
          comment: reviewText || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      router.refresh()
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg shadow-2xl rounded-[2rem] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-black">{t("title")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("subtitle")} {booking.studio.title}</p>
            </div>
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Studio Preview */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
              {coverImage ? (
                <Image
                  src={coverImage.image_url}
                  alt={booking.studio.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400">image</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-black">{booking.studio.title}</h3>
              <p className="text-sm text-gray-500">{booking.studio.city}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(booking.start_datetime).toLocaleDateString(dateLocale, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 mb-3">{t("ratingQuestion")}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined text-4xl transition-colors ${
                      star <= displayRating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    style={{ fontVariationSettings: star <= displayRating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {displayRating === 1 && t("ratingPoor")}
                {displayRating === 2 && t("ratingFair")}
                {displayRating === 3 && t("ratingGood")}
                {displayRating === 4 && t("ratingVeryGood")}
                {displayRating === 5 && t("ratingExcellent")}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">
              {t("textLabel")}
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t("textPlaceholder")}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {reviewText.length}/500
            </p>
          </div>

          {/* Quick Tags */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">{t("tagsLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {[t("tagGreatLocation"), t("tagCleanSpace"), t("tagFriendlyHost"), t("tagGoodEquipment"), t("tagValueForMoney"), t("tagEasyCheckin")].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (reviewText.includes(tag)) {
                      setReviewText(reviewText.replace(tag, "").trim())
                    } else {
                      setReviewText(reviewText ? `${reviewText} ${tag}` : tag)
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    reviewText.includes(tag)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`flex-1 px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                rating > 0 && !isSubmitting
                  ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  {t("submitting")}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  {t("submitReview")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
