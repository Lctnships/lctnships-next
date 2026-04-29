"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"

type NotificationType = "all" | "bookings" | "messages" | "projects"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  is_read: boolean
  created_at: string
}

const typeIcons: Record<string, { icon: string; bgClass: string; textClass: string }> = {
  booking_request: { icon: "calendar_today", bgClass: "bg-gray-100", textClass: "text-black" },
  booking_confirmed: { icon: "check_circle", bgClass: "bg-green-100", textClass: "text-green-600" },
  booking_cancelled: { icon: "cancel", bgClass: "bg-red-100", textClass: "text-red-600" },
  booking_rescheduled: { icon: "schedule", bgClass: "bg-orange-100", textClass: "text-orange-600" },
  new_message: { icon: "chat_bubble", bgClass: "bg-indigo-100", textClass: "text-indigo-600" },
  new_review: { icon: "star", bgClass: "bg-amber-100", textClass: "text-amber-600" },
  payout_processed: { icon: "payments", bgClass: "bg-emerald-100", textClass: "text-emerald-600" },
  default: { icon: "notifications", bgClass: "bg-gray-100", textClass: "text-gray-600" },
}

function getRelativeTime(
  dateString: string,
  t: (key: string, values?: Record<string, unknown>) => string,
  dateLocale: string
): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return t("justNow")
  if (diffInSeconds < 3600) return t("minutesAgo", { count: Math.floor(diffInSeconds / 60) })
  if (diffInSeconds < 86400) return t("hoursAgo", { count: Math.floor(diffInSeconds / 3600) })
  if (diffInSeconds < 604800) return t("daysAgo", { count: Math.floor(diffInSeconds / 86400) })
  return date.toLocaleDateString(dateLocale, { month: "short", day: "numeric" })
}

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const t = useTranslations("Notifications")
  const locale = useLocale()
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const [filter, setFilter] = useState<NotificationType>("all")
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

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
        body: JSON.stringify({ mark_all: true }),
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
        body: JSON.stringify({ notification_ids: [id] }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t("subtitle")}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="group flex items-center gap-2 px-6 h-12 bg-white rounded-full border border-gray-200 hover:border-black transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-black transition-colors">
              done_all
            </span>
            <span className="text-sm font-bold">{t("markAllRead")}</span>
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
        {(["all", "bookings", "messages", "projects"] as NotificationType[]).map((type) => {
          const labels: Record<string, string> = {
            all: t("filterAll"),
            bookings: t("filterBookings"),
            messages: t("filterMessages"),
            projects: t("filterProjects"),
          }
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 transition-all ${
                filter === type
                  ? "bg-black text-white shadow-lg shadow-black/10"
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
                  : "bg-white border-transparent hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200"
              }`}
            >
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
                  <p className="text-gray-500 text-base mt-1 line-clamp-1">{notification.message}</p>
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
                        : "bg-black hover:bg-gray-800 text-white"
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

      <div className="mt-12 flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">info</span>
          <span>{t("footer")}</span>
        </div>
      </div>
    </div>
  )
}
