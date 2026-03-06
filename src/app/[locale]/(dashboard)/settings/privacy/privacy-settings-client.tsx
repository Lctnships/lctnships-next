"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

interface NotificationChannel {
  email: boolean
  sms: boolean
  push: boolean
}

interface NotificationSettings {
  newBookings: NotificationChannel
  messages: NotificationChannel
  platformUpdates: NotificationChannel
  reviews: NotificationChannel
}

interface PrivacySettings {
  profileVisibility: string
  showPortfolioToUnregistered: boolean
}

interface PrivacySettingsClientProps {
  notificationSettings: NotificationSettings
  privacySettings: PrivacySettings
  settingsHref?: string
}

export function PrivacySettingsClient({
  notificationSettings: initialNotificationSettings,
  privacySettings: initialPrivacySettings,
  settingsHref = "/settings",
}: PrivacySettingsClientProps) {
  const [notifications, setNotifications] = useState(initialNotificationSettings)
  const [privacy, setPrivacy] = useState(initialPrivacySettings)
  const t = useTranslations("Privacy")

  const notificationTypes = [
    {
      key: "newBookings" as const,
      title: t("newBookingsTitle"),
      description: t("newBookingsDesc"),
    },
    {
      key: "messages" as const,
      title: t("messagesTitle"),
      description: t("messagesDesc"),
    },
    {
      key: "platformUpdates" as const,
      title: t("platformUpdatesTitle"),
      description: t("platformUpdatesDesc"),
    },
    {
      key: "reviews" as const,
      title: t("reviewsTitle"),
      description: t("reviewsDesc"),
    },
  ]

  const updateNotification = (
    type: keyof NotificationSettings,
    channel: keyof NotificationChannel,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value,
      },
    }))
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: notifications.newBookings.email,
          sms_notifications: notifications.newBookings.sms,
          push_notifications: notifications.newBookings.push,
          marketing_emails: notifications.platformUpdates.email,
        }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      toast.success(t("saveSuccess") || "Settings saved successfully")
    } catch {
      toast.error(t("saveError") || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link href={settingsHref as "/settings"} className="text-gray-500 font-medium">
          {t("breadcrumbSettings")}
        </Link>
        <span className="text-gray-500 font-medium">/</span>
        <span className="font-bold">{t("breadcrumbCurrent")}</span>
      </div>

      {/* Page Heading */}
      <div className="flex flex-col gap-1 md:gap-2">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t("heading")}</h2>
        <p className="text-gray-500 text-sm md:text-lg">
          {t("headingDescription")}
        </p>
      </div>

      {/* Notifications Section */}
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">notifications_active</span>
          <h3 className="text-base md:text-2xl font-bold">{t("notificationPreferences")}</h3>
        </div>

        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.key} className="border border-gray-100 rounded-xl p-3">
              <p className="font-bold text-sm mb-1">{type.title}</p>
              <p className="text-xs text-gray-500 mb-3">{type.description}</p>
              <div className="flex items-center gap-4">
                {(["email", "sms", "push"] as const).map((channel) => (
                  <label key={channel} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[type.key][channel]}
                      onChange={(e) =>
                        updateNotification(type.key, channel, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("tableEventType")}
                </th>
                <th className="pb-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("tableEmail")}
                </th>
                <th className="pb-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("tableSms")}
                </th>
                <th className="pb-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-center">
                  {t("tablePush")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notificationTypes.map((type) => (
                <tr key={type.key}>
                  <td className="py-6">
                    <p className="font-bold">{type.title}</p>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </td>
                  {(["email", "sms", "push"] as const).map((channel) => (
                    <td key={channel} className="py-6 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[type.key][channel]}
                          onChange={(e) =>
                            updateNotification(type.key, channel, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">visibility</span>
          <h3 className="text-base md:text-2xl font-bold">{t("privacySettings")}</h3>
        </div>

        <div className="flex flex-col gap-5 md:gap-8">
          {/* Profile Visibility Dropdown */}
          <div className="md:max-w-md">
            <label className="block text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 md:mb-3">
              {t("profileVisibility")}
            </label>
            <div className="relative">
              <select
                value={privacy.profileVisibility}
                onChange={(e) =>
                  setPrivacy((prev) => ({ ...prev, profileVisibility: e.target.value }))
                }
                className="w-full h-12 md:h-14 bg-gray-50 border-none rounded-xl md:rounded-2xl px-4 md:px-5 appearance-none focus:ring-2 focus:ring-black font-medium text-sm md:text-base"
              >
                <option value="public">{t("visibilityPublic")}</option>
                <option value="marketplace">{t("visibilityMarketplace")}</option>
                <option value="private">{t("visibilityPrivate")}</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                expand_more
              </span>
            </div>
            <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-gray-500">
              {t("visibilityDescription")}
            </p>
          </div>

          {/* Portfolio Checkbox */}
          <div className="flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="portfolio-visibility"
                type="checkbox"
                checked={privacy.showPortfolioToUnregistered}
                onChange={(e) =>
                  setPrivacy((prev) => ({
                    ...prev,
                    showPortfolioToUnregistered: e.target.checked,
                  }))
                }
                className="w-5 h-5 md:w-6 md:h-6 rounded border-gray-300 text-black focus:ring-black"
              />
            </div>
            <label htmlFor="portfolio-visibility" className="flex flex-col cursor-pointer">
              <span className="font-bold text-sm md:text-base">{t("showPortfolio")}</span>
              <span className="text-xs md:text-sm text-gray-500">
                {t("showPortfolioDesc")}
              </span>
            </label>
          </div>

          {/* Data usage notice */}
          <div className="p-4 md:p-5 border border-dashed border-gray-200 rounded-xl md:rounded-2xl">
            <div className="flex gap-2 md:gap-3">
              <span className="material-symbols-outlined text-gray-500 text-lg md:text-xl">info</span>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">
                {t("privacyNotice")}
              </p>
            </div>
            <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-gray-500 leading-normal">
              {t("privacyNoticeText")}
            </p>
          </div>
        </div>
      </section>

      {/* Save Action Button */}
      <div className="flex justify-end pt-2 md:pt-4 mb-6 md:mb-10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 md:px-10 md:py-5 rounded-full font-bold text-sm md:text-lg shadow-lg shadow-black/10 transition-all flex items-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg md:text-2xl">{isSaving ? "hourglass_empty" : "check_circle"}</span>
          {isSaving ? (t("saving") || "Saving...") : t("saveButton")}
        </button>
      </div>
    </div>
  )
}
