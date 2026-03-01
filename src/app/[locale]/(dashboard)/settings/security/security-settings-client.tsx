"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

interface Device {
  id: string
  name: string
  type: "laptop" | "phone" | "desktop" | "tablet"
  location: string
  browser: string
  isCurrent: boolean
}

interface SecuritySettingsClientProps {
  devices: Device[]
  twoFactorEnabled: boolean
}

export function SecuritySettingsClient({
  devices: initialDevices,
  twoFactorEnabled: initialTwoFactor,
}: SecuritySettingsClientProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactor)
  const [devices, setDevices] = useState(initialDevices)
  const t = useTranslations("Security")

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "" }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = [t("strengthWeak"), t("strengthFair"), t("strengthMedium"), t("strengthStrong")]
    return { level: strength, label: labels[strength - 1] || "" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      laptop: "laptop_mac",
      phone: "smartphone",
      desktop: "desktop_windows",
      tablet: "tablet_mac",
    }
    return icons[type] || "devices"
  }

  const handleLogoutDevice = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId))
  }

  const handleSave = () => {
    // TODO: Save security settings
    console.log({ currentPassword, newPassword, twoFactorEnabled })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/settings" className="text-gray-500 font-medium">
          {t("breadcrumbSettings")}
        </Link>
        <span className="text-gray-500 font-medium">/</span>
        <span className="font-bold">{t("breadcrumbCurrent")}</span>
      </div>

      {/* Page Heading */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight">{t("heading")}</h2>
        <p className="text-gray-500 text-lg max-w-2xl">
          {t("headingDescription")}
        </p>
      </div>

      {/* Change Password Card */}
      <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-black">lock_reset</span>
          <h3 className="text-2xl font-bold tracking-tight">{t("changePassword")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-3 ml-1">{t("currentPassword")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 h-14 px-5 focus:border-black focus:ring-0 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-3 ml-1">{t("newPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 h-14 px-5 focus:border-black focus:ring-0 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="mt-4 flex items-center gap-2 px-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 w-12 rounded-full ${
                    level <= passwordStrength.level ? "bg-black" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-black uppercase tracking-widest ml-2">
              {t("strengthLabel")} {passwordStrength.label}
            </span>
          </div>
        )}
      </section>

      {/* 2FA Section */}
      <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-black">vibration</span>
              <h3 className="text-2xl font-bold tracking-tight">{t("twoFactor")}</h3>
            </div>
            <p className="text-gray-500 text-base leading-relaxed">
              {t("twoFactorDesc")}
            </p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
            </label>
          </div>
        </div>
      </section>

      {/* Logged-in Devices */}
      <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-black">devices</span>
          <h3 className="text-2xl font-bold tracking-tight">{t("loggedInDevices")}</h3>
        </div>

        <div className="space-y-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined">{getDeviceIcon(device.type)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{device.name}</p>
                    {device.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter">
                        {t("currentSession")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {device.location} • {device.browser}
                  </p>
                </div>
              </div>
              {!device.isCurrent && (
                <button
                  onClick={() => handleLogoutDevice(device.id)}
                  className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
                >
                  {t("logout")}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex justify-end pt-4 pb-12">
        <button
          onClick={handleSave}
          className="bg-black text-white text-base font-bold px-10 py-5 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-3"
        >
          <span className="material-symbols-outlined">shield</span>
          {t("saveButton")}
        </button>
      </div>
    </div>
  )
}
