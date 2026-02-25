"use client"

import { useState } from "react"
import Link from "next/link"
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
  response_rate?: number
  response_time?: string
  equipment_preferences?: string[]
  is_accepting_projects?: boolean
  portfolio?: { id: string; title: string; image: string }[]
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
  studio_images?: { url: string }[]
}

interface ProfileClientProps {
  profile: Profile
  stats: Stats
  studios: Studio[]
  isOwnProfile: boolean
}

type TabType = "portfolio" | "reviews" | "history"

export function ProfileClient({ profile, stats, studios, isOwnProfile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("portfolio")

  const memberSince = new Date(profile.created_at).getFullYear()
  const isHost = profile.user_type === "host" || profile.user_type === "both"

  const getStudioImage = (studio: Studio) => {
    return studio.images?.[0] || studio.studio_images?.[0]?.url || ""
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative">
            <div
              className="size-32 md:size-40 rounded-full bg-cover bg-center border-4 border-white shadow-xl bg-gray-200"
              style={profile.avatar_url ? { backgroundImage: `url("${profile.avatar_url}")` } : {}}
            >
              {!profile.avatar_url && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400">person</span>
                </div>
              )}
            </div>
            {profile.is_verified && (
              <div className="absolute bottom-2 right-2 bg-primary text-white p-1 rounded-full border-2 border-white">
                <span className="material-symbols-outlined text-sm leading-none block">verified</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center pt-2">
            <h1 className="text-4xl font-extrabold tracking-tight mb-1">{profile.full_name}</h1>
            <p className="text-primary font-semibold text-lg mb-3">{profile.professional_title}</p>
            <p className="text-gray-500 max-w-xl text-base leading-relaxed">
              Based in {profile.location} • {profile.bio}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="flex-1 md:flex-none min-w-[120px] bg-white border border-gray-200 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors text-center"
            >
              Edit Profile
            </Link>
          ) : (
            <>
              <button className="flex-1 md:flex-none min-w-[120px] bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                Message
              </button>
              <button className="flex-1 md:flex-none min-w-[120px] bg-white border border-gray-200 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors">
                Follow
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Tabs and Portfolio/Listings */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-10">
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-colors ${
                  activeTab === "portfolio"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {isHost ? "LISTINGS" : "PORTFOLIO"}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-colors ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                REVIEWS
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-4 border-b-2 font-bold text-sm tracking-wide transition-colors ${
                  activeTab === "history"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                STUDIO HISTORY
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "portfolio" && !isHost && profile.portfolio && (
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
          )}

          {activeTab === "portfolio" && isHost && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {studios.map((studio) => (
                <Link
                  key={studio.id}
                  href={`/studios/${studio.id}`}
                  className="group bg-white rounded-xl overflow-hidden border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url("${getStudioImage(studio)}")` }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full font-bold text-sm">
                      €{studio.price_per_hour}/hr
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{studio.title}</h4>
                      {studio.avg_rating && (
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <span className="material-symbols-outlined text-primary text-base">star</span>
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
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">rate_review</span>
              <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
              <p className="text-gray-500">Reviews will appear here after completed bookings</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">history</span>
              <h3 className="text-xl font-bold mb-2">No booking history</h3>
              <p className="text-gray-500">Your studio booking history will appear here</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
          {/* Member Status */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Professional Profile</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Verified Professional</p>
                  <p className="text-xs text-gray-500">Member since {memberSince}</p>
                </div>
              </div>

              {profile.equipment_preferences && profile.equipment_preferences.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-bold mb-3">Equipment Preferences</p>
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
                <p className="text-sm font-bold mb-3">Availability</p>
                <div className={`flex items-center gap-2 ${profile.is_accepting_projects ? "text-green-500" : "text-gray-500"}`}>
                  <span className={`size-2 rounded-full ${profile.is_accepting_projects ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                  <span className="text-sm font-medium">
                    {profile.is_accepting_projects ? "Accepting New Projects" : "Not Available"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-bold mb-3">Connect</p>
                <div className="flex gap-4">
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-lg">camera_alt</span>
                  </button>
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                  <button className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </button>
                </div>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="block w-full mt-8 bg-gray-100 text-center py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
            >
              View Full Bio
            </Link>
          </div>

          {/* Performance Stats (for hosts) */}
          {isHost && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">hotel_class</span>
                    <span className="text-sm font-medium">Average Rating</span>
                  </div>
                  <span className="font-bold text-lg">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "5.0"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">timer</span>
                    <span className="text-sm font-medium">Response Time</span>
                  </div>
                  <span className="font-bold text-lg">&lt; 1hr</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    <span className="text-sm font-medium">Total Bookings</span>
                  </div>
                  <span className="font-bold text-lg">{stats.bookingCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Studio Preferences */}
          <div className="bg-primary/5 p-8 rounded-xl border border-primary/20">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Preferred Spaces</h3>
            <p className="text-sm leading-relaxed mb-4">
              {profile.full_name} typically books daylight studios with ceiling heights of 12ft+ and cyclorama walls.
            </p>
            <Link href="/bookings" className="text-sm font-extrabold text-primary underline underline-offset-4 decoration-2">
              See Past Bookings
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
