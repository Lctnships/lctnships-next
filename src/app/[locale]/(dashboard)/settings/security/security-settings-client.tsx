"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

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
  settingsHref?: string
}

export function SecuritySettingsClient({
  devices: initialDevices,
  twoFactorEnabled: initialTwoFactor,
  settingsHref = "/settings",
}: SecuritySettingsClientProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactor)
  const [devices, setDevices] = useState(initialDevices)
  const t = useTranslations("Security")
  const ensuredRef = useRef(false)

  // Auto-register current session if none exist (for users who logged in before tracking)
  useEffect(() => {
    if (devices.length === 0 && !ensuredRef.current) {
      ensuredRef.current = true
      fetch("/api/sessions/ensure", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.created && data.session) {
            setDevices([data.session])
          }
        })
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const formatLocation = (location: string) => {
    if (!location || location === "Unknown") return t("unknownLocation") || "Unknown"
    // Strip IPv6-mapped IPv4 prefix
    const clean = location.replace(/^::ffff:/, "")
    // Show friendly name for localhost
    if (clean === "127.0.0.1" || clean === "::1" || clean === "localhost") {
      return t("localDevice") || "Local"
    }
    return clean
  }

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      laptop: "laptop_mac",
      phone: "smartphone",
      desktop: "desktop_windows",
      tablet: "tablet_mac",
    }
    return icons[type] || "devices"
  }

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/sessions/${deviceId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to logout device")
      setDevices(devices.filter((d) => d.id !== deviceId))
      toast.success(t("deviceLoggedOut") || "Device logged out successfully")
    } catch {
      toast.error(t("deviceLogoutError") || "Failed to logout device")
    }
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(t("passwordRequired") || "Please fill in both password fields")
      return
    }
    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort") || "New password must be at least 8 characters")
      return
    }
    setIsChangingPassword(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")
      toast.success(t("passwordChanged") || "Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      toast.error(err.message || t("passwordChangeError") || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          two_factor_enabled: twoFactorEnabled,
        }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      toast.success(t("saveSuccess") || "Security settings saved successfully")
    } catch {
      toast.error(t("saveError") || "Failed to save security settings")
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
        <p className="text-gray-500 text-sm md:text-lg max-w-2xl">
          {t("headingDescription")}
        </p>
      </div>

      {/* Change Password Card */}
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">lock_reset</span>
          <h3 className="text-base md:text-2xl font-bold tracking-tight">{t("changePassword")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl">
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-3 ml-1">{t("currentPassword")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 h-12 md:h-14 px-4 md:px-5 text-sm md:text-base focus:border-black focus:ring-0 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-3 ml-1">{t("newPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 h-12 md:h-14 px-4 md:px-5 text-sm md:text-base focus:border-black focus:ring-0 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="mt-3 md:mt-4 flex items-center gap-2 px-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 w-8 md:w-12 rounded-full ${
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

        {/* Change Password Button */}
        {(currentPassword || newPassword) && (
          <div className="mt-4 md:mt-6">
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword}
              className="bg-black text-white text-xs md:text-sm font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base md:text-lg">{isChangingPassword ? "hourglass_empty" : "lock_reset"}</span>
              {isChangingPassword ? (t("saving") || "Saving...") : (t("changePasswordButton") || "Change Password")}
            </button>
          </div>
        )}
      </section>

      {/* 2FA Section */}
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1 md:gap-2 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
              <span className="material-symbols-outlined text-black text-xl md:text-2xl">vibration</span>
              <h3 className="text-base md:text-2xl font-bold tracking-tight">{t("twoFactor")}</h3>
            </div>
            <p className="text-gray-500 text-xs md:text-base leading-relaxed">
              {t("twoFactorDesc")}
            </p>
          </div>
          <div className="flex-shrink-0">
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
      <section className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
          <span className="material-symbols-outlined text-black text-xl md:text-2xl">devices</span>
          <h3 className="text-base md:text-2xl font-bold tracking-tight">{t("loggedInDevices")}</h3>
        </div>

        <div className="space-y-3 md:space-y-6">
          {devices.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base py-4">
              {t("noDevices") || "No active sessions found. Sessions are recorded when you log in."}
            </p>
          )}
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between py-3 md:py-4 border-b border-gray-100 last:border-0 gap-3"
            >
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-lg md:text-2xl">{getDeviceIcon(device.type)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm md:text-base">{device.name}</p>
                    {device.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter">
                        {t("currentSession")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                    {formatLocation(device.location)} • {device.browser}
                  </p>
                </div>
              </div>
              {!device.isCurrent && (
                <button
                  onClick={() => handleLogoutDevice(device.id)}
                  className="text-xs md:text-sm font-bold text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  {t("logout")}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex justify-end pt-2 md:pt-4 pb-6 md:pb-12">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black text-white text-sm md:text-base font-bold px-6 py-3 md:px-10 md:py-5 rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg md:text-2xl">{isSaving ? "hourglass_empty" : "shield"}</span>
          {isSaving ? (t("saving") || "Saving...") : t("saveButton")}
        </button>
      </div>
    </div>
  )
}
