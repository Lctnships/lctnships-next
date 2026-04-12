"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import Image from "next/image"

interface Profile {
  id: string
  full_name: string
  email?: string
  avatar_url?: string
  bio?: string
  location?: string
  professional_title?: string
  user_type: string
  is_verified?: boolean
  created_at: string
  equipment_preferences?: string[]
  is_accepting_projects?: boolean
  portfolio?: { id: string; title: string; image: string; description?: string; project_type?: string }[]
}

interface Stats {
  bookingCount: number
  avgRating: number
  reviewCount: number
}

interface Studio {
  id: string
  title: string
  location?: string
  price_per_hour: number
  avg_rating?: number
  images?: string[]
  studio_images?: { image_url: string }[]
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer_name: string
  reviewer_avatar: string
}

interface BookingHistoryItem {
  id: string
  studio_title: string
  studio_city: string
  studio_image: string
  date: string
  total_hours: number
  total_amount: number
  status: string
}

interface ProfileClientProps {
  profile: Profile
  stats: Stats
  studios: Studio[]
  isOwnProfile: boolean
  reviews?: Review[]
  bookingHistory?: BookingHistoryItem[]
}

type TabType = "portfolio" | "reviews" | "history"

export function ProfileClient({ profile, stats, studios, isOwnProfile, reviews = [], bookingHistory = [] }: ProfileClientProps) {
  const t = useTranslations("Profile")
  const [activeTab, setActiveTab] = useState<TabType>("portfolio")

  const memberSince = new Date(profile.created_at).getFullYear()
  const isHost = profile.user_type === "host" || profile.user_type === "both"

  const getStudioImage = (studio: Studio) => {
    return studio.images?.[0] || studio.studio_images?.[0]?.image_url || ""
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 md:gap-8 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-center sm:items-start text-center sm:text-left">
          <div className="relative shrink-0">
            <div
              className="size-24 sm:size-32 md:size-40 rounded-full bg-cover bg-center border-4 border-white shadow-xl bg-gray-200"
              style={profile.avatar_url ? { backgroundImage: `url("${profile.avatar_url}")` } : {}}
            >
              {!profile.avatar_url && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl sm:text-6xl text-gray-400">person</span>
                </div>
              )}
            </div>
            {profile.is_verified && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black text-white p-1 rounded-full border-2 border-white">
                <span className="material-symbols-outlined text-sm leading-none block">verified</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center pt-0 sm:pt-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1">{profile.full_name}</h1>
            <p className="text-black font-semibold text-base md:text-lg mb-2 md:mb-3">{profile.professional_title}</p>
            <p className="text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
              {t("basedIn")} {profile.location} • {profile.bio}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-center sm:justify-start">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="flex-1 sm:flex-none min-w-[120px] bg-white border border-gray-200 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold hover:bg-gray-50 transition-colors text-center text-sm md:text-base"
            >
              {t("editProfile")}
            </Link>
          ) : (
            <>
              <button className="flex-1 sm:flex-none min-w-[100px] md:min-w-[120px] bg-black text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform text-sm md:text-base">
                {t("message")}
              </button>
              <button className="flex-1 sm:flex-none min-w-[100px] md:min-w-[120px] bg-white border border-gray-200 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm md:text-base">
                {t("follow")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Tabs and Portfolio/Listings */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 md:mb-8">
            <div className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`pb-3 md:pb-4 border-b-2 font-bold text-xs sm:text-sm tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === "portfolio"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {isHost ? t("tabListings") : t("tabPortfolio")}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 md:pb-4 border-b-2 font-bold text-xs sm:text-sm tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {t("tabReviews")}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 md:pb-4 border-b-2 font-bold text-xs sm:text-sm tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === "history"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {t("tabStudioHistory")}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "portfolio" && !isHost && (
            <>
              {profile.portfolio && profile.portfolio.length > 0 ? (
                <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                  {profile.portfolio.map((item) => (
                    <div key={item.id} className="break-inside-avoid">
                      <div className="group relative overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <p className="text-white font-medium">{item.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <span className="material-symbols-outlined text-5xl md:text-6xl text-gray-300 mb-3 md:mb-4">photo_library</span>
                  <h3 className="text-lg md:text-xl font-bold mb-2">{t("noPortfolio") || "Nog geen portfolio"}</h3>
                  <p className="text-gray-500 mb-4">{t("noPortfolioDesc") || "Voeg foto's toe van je beste werk om hosts te overtuigen."}</p>
                  {isOwnProfile && (
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                      {t("addPortfolioItem") || "Portfolio toevoegen"}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "portfolio" && isHost && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {studios.map((studio) => (
                <Link
                  key={studio.id}
                  href={`/studios/${studio.id}`}
                  className="group bg-white rounded-xl overflow-hidden border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url("${getStudioImage(studio)}")` }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full font-bold text-sm">
                      €{studio.price_per_hour}{t("perHour")}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold group-hover:text-black transition-colors">{studio.title}</h4>
                      {studio.avg_rating && (
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <span className="material-symbols-outlined text-black text-base">star</span>
                          <span>{studio.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{studio.location}</p>
                  </div>
                </Link>
              ))}



            </div>
          )}

          {activeTab === "reviews" && (
            reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {review.reviewer_avatar ? (
                          <Image src={review.reviewer_avatar} alt="" width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">person</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{review.reviewer_name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-200"}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-gray-300 mb-3 md:mb-4">rate_review</span>
                <h3 className="text-lg md:text-xl font-bold mb-2">{t("noReviews")}</h3>
                <p className="text-gray-500">{t("noReviewsDesc")}</p>
              </div>
            )
          )}

          {activeTab === "history" && (
            bookingHistory.length > 0 ? (
              <div className="space-y-3">
                {bookingHistory.map((booking) => (
                  <Link key={booking.id} href={`/bookings/${booking.id}`} className="block">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                      <div className="size-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                        {booking.studio_image ? (
                          <Image src={booking.studio_image} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{booking.studio_title}</p>
                        <p className="text-xs text-gray-500">{booking.studio_city} &bull; {new Date(booking.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{booking.total_hours}h &bull; €{booking.total_amount}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        booking.status === "completed" ? "bg-green-100 text-green-700" :
                        booking.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{booking.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-gray-300 mb-3 md:mb-4">history</span>
                <h3 className="text-lg md:text-xl font-bold mb-2">{t("noBookingHistory")}</h3>
                <p className="text-gray-500">{t("noBookingHistoryDesc")}</p>
              </div>
            )
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 space-y-6 lg:space-y-8">
          {/* Member Status */}
          <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 sm:mb-6">{t("sidebarProfessionalProfile")}</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-black">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{t("sidebarVerifiedProfessional")}</p>
                  <p className="text-xs text-gray-500">{t("sidebarMemberSince")} {memberSince}</p>
                </div>
              </div>

              {profile.equipment_preferences && profile.equipment_preferences.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-bold mb-3">{t("sidebarEquipmentPreferences")}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.equipment_preferences.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-bold mb-3">{t("sidebarAvailability")}</p>
                <div className={`flex items-center gap-2 ${profile.is_accepting_projects ? "text-green-500" : "text-gray-500"}`}>
                  <span className={`size-2 rounded-full ${profile.is_accepting_projects ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                  <span className="text-sm font-medium">
                    {profile.is_accepting_projects ? t("sidebarAvailableForProjects") : t("sidebarNotAvailable")}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-bold mb-3">{t("sidebarConnect")}</p>
                <div className="flex gap-4">
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                    <span className="material-symbols-outlined text-lg">camera_alt</span>
                  </button>
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </button>
                </div>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="block w-full mt-6 sm:mt-8 bg-gray-100 text-center py-2.5 sm:py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
            >
              {t("sidebarViewFullBio")}
            </Link>
          </div>

          {/* Performance Stats (for hosts) */}
          {isHost && (
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 sm:mb-6">{t("sidebarPerformance")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-black">hotel_class</span>
                    <span className="text-sm font-medium">{t("sidebarAvgRating")}</span>
                  </div>
                  <span className="font-bold text-lg">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-black">event_available</span>
                    <span className="text-sm font-medium">{t("sidebarTotalBookings")}</span>
                  </div>
                  <span className="font-bold text-lg">{stats.bookingCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Studio Preferences */}
          <div className="bg-gray-100 p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200">
            <h3 className="text-xs sm:text-sm font-bold text-black uppercase tracking-widest mb-3 sm:mb-4">{t("sidebarFavoriteSpaces")}</h3>
            <p className="text-sm leading-relaxed mb-3 sm:mb-4">
              {profile.full_name} {t("sidebarFavoriteSpacesDesc")}
            </p>
            <Link href="/bookings" className="text-sm font-extrabold text-black underline underline-offset-4 decoration-2">
              {t("sidebarViewPreviousBookings")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
