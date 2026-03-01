"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/routing"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Auth")

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error(t("invalidResetLink"), {
          description: t("requestNewLink"),
        })
        router.push("/forgot-password")
      }
    }
    checkSession()
  }, [supabase, router, t])

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "", color: "" }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const levels = [
      { level: 1, label: t("passwordWeak"), color: "bg-red-500" },
      { level: 2, label: t("passwordFair"), color: "bg-orange-500" },
      { level: 3, label: t("passwordGood"), color: "bg-yellow-500" },
      { level: 4, label: t("passwordStrong"), color: "bg-emerald-500" },
    ]
    return levels[strength - 1] || { level: 0, label: "", color: "" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"), {
        description: t("passwordsDoNotMatchDesc"),
      })
      return
    }

    if (password.length < 8) {
      toast.error(t("passwordTooShort"), {
        description: t("passwordMinChars"),
      })
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast.error(t("updatePasswordError"), {
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    toast.success(t("passwordUpdated"), {
      description: t("passwordUpdatedDesc"),
    })

    // Sign out and redirect to login
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full flex justify-center pt-12 pb-6">
        <Link href="/" className="flex items-center gap-2 text-black">
          <div className="size-8">
            <svg className="text-black" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
              <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-gray-900 text-2xl font-extrabold tracking-tight">lcntships</h2>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 flex flex-col items-center">
          <h1 className="text-gray-900 text-center tracking-tight text-[32px] font-bold leading-tight pt-2 pb-3">
            {t("newPasswordTitle")}
          </h1>
          <p className="text-gray-500 text-center text-base font-normal leading-relaxed max-w-[360px] pb-10">
            {t("newPasswordSubtitle")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="px-4">
                <span className="text-gray-900 text-sm font-semibold uppercase tracking-wider">
                  {t("newPasswordLabel")}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full rounded-full text-gray-900 border border-gray-200 bg-gray-50 h-14 placeholder:text-gray-400 px-6 pr-14 text-base font-normal transition-all focus:border-black focus:ring-2 focus:ring-black/20 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="px-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-xs font-medium">{t("passwordStrength")}</span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        passwordStrength.level === 4
                          ? "text-emerald-500"
                          : passwordStrength.level === 3
                          ? "text-yellow-500"
                          : passwordStrength.level === 2
                          ? "text-orange-500"
                          : "text-red-500"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full ${
                          level <= passwordStrength.level ? passwordStrength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="px-4">
                <span className="text-gray-900 text-sm font-semibold uppercase tracking-wider">
                  {t("confirmPasswordLabel")}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`flex w-full rounded-full text-gray-900 border bg-gray-50 h-14 placeholder:text-gray-400 px-6 pr-14 text-base font-normal transition-all focus:ring-2 outline-none ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-black focus:ring-black/20"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="px-4 text-sm text-red-500">{t("passwordsDoNotMatch")}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || password !== confirmPassword || password.length < 8}
                className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 bg-black hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="truncate">{t("updatePasswordButton")}</span>
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-8">
            <Link
              href="/login"
              className="group flex items-center gap-2 text-black font-semibold text-sm hover:underline underline-offset-4 decoration-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              {t("backToLoginLink")}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {t("copyright")}. {t("allRightsReserved")}
        </p>
      </footer>
    </div>
  )
}
