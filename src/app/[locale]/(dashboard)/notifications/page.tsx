"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

type NotificationType = "all" | "bookings" | "messages" | "projects"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

const typeIcons: Record<string, { icon: string; bgClass: string; textClass: string }> = {
  booking_request: {
    icon: "calendar_today",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  booking_confirmed: {
    icon: "check_circle",
    bgClass: "bg-green-100",
    textClass: "text-green-600",
  },
  booking_cancelled: {
    icon: "cancel",
    bgClass: "bg-red-100",
    textClass: "text-red-600",
  },
  booking_rescheduled: {
    icon: "schedule",
    bgClass: "bg-orange-100",
    textClass: "text-orange-600",
  },
  new_message: {
    icon: "chat_bubble",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-600",
  },
  new_review: {
    icon: "star",
    bgClass: "bg-amber-100",
    textClass: "text-amber-600",
  },
  payout_processed: {
    icon: "payments",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-600",
  },
  default: {
    icon: "notifications",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
  },
}

function getRelativeTime(dateString: string, t: (key: string, values?: Record<string, unknown>) => string, dateLocale: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return t("justNow")
  if (diffInSeconds < 3600) return t("minutesAgo", { count: Math.floor(diffInSeconds / 60) })
  if (diffInSeconds < 86400) return t("hoursAgo", { count: Math.floor(diffInSeconds / 3600) })
  if (diffInSeconds < 604800) return t("daysAgo", { count: Math.floor(diffInSeconds / 86400) })
  return date.toLocaleDateString(dateLocale, { month: "short", day: "numeric" })
}

export default function NotificationsPage() {
  const t = useTranslations("Notifications")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const [filter, setFilter] = useState<NotificationType>("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications")
      }

      setNotifications(data.notifications || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "bookings") return n.type.includes("booking")
    if (filter === "messages") return n.type.includes("message")
    if (filter === "projects") return n.type.includes("review") || n.type.includes("payout")
    return true
  })

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all_read: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-gray-500">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <p className="mt-4 text-red-500">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return <NotificationsEmptyState t={t} />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 mt-2 font-medium">
            {t("subtitle")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="group flex items-center gap-2 px-6 h-12 bg-white rounded-full border border-gray-200 hover:border-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-primary transition-colors">
              done_all
            </span>
            <span className="text-sm font-bold">{t("markAllRead")}</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
        {(["all", "bookings", "messages", "projects"] as NotificationType[]).map((type) => {
          const labels: Record<string, string> = { all: t("filterAll"), bookings: t("filterBookings"), messages: t("filterMessages"), projects: t("filterProjects") }
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 transition-all ${
                filter === type
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border border-gray-100 text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className={`text-sm ${filter === type ? "font-bold" : "font-semibold"}`}>
                {labels[type]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {filteredNotifications.map((notification) => {
          const iconConfig = typeIcons[notification.type] || typeIcons.default
          return (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={`relative group flex items-center justify-between gap-6 p-6 rounded-2xl transition-all border cursor-pointer ${
                notification.is_read
                  ? "bg-gray-50 border-gray-100 opacity-80 hover:opacity-100"
                  : "bg-white border-transparent hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/20"
              }`}
            >
              {/* Unread Indicator Dot */}
              {!notification.is_read && (
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_0_4px_white] z-10" />
              )}

              <div className="flex items-center gap-5 flex-1">
                <div
                  className={`flex items-center justify-center rounded-2xl shrink-0 size-14 ${iconConfig.bgClass} ${iconConfig.textClass}`}
                >
                  <span className="material-symbols-outlined text-2xl">{iconConfig.icon}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold leading-tight">{notification.title}</h3>
                  <p className="text-gray-500 text-base mt-1 line-clamp-1">
                    {notification.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  {getRelativeTime(notification.created_at, t, dateLocale)}
                </span>
                {notification.link && (
                  <Link
                    href={notification.link}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      notification.is_read
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {t("view")}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">info</span>
          <span>{t("footer")}</span>
        </div>
      </div>
    </div>
  )
}

function NotificationsEmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12">
      <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
        {/* Visual */}
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-2xl shadow-primary/5 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10" />
          <div
            className="bg-center bg-no-repeat bg-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800')`,
            }}
          />
          <div className="absolute -top-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 size-40 bg-primary/10 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">{t("emptyTitle")}</h1>
          <p className="text-gray-500 text-base font-medium max-w-[420px] leading-relaxed">
            {t("emptyDescription")}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            href="/studios"
            className="group flex items-center justify-center gap-2 min-w-[220px] bg-primary text-white py-4 px-8 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <span>{t("emptyCta")}</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
