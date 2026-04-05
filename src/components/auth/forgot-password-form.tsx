"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import Image from "next/image"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()
  const t = useTranslations("Auth")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(t("errorOccurred"), {
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(t("errorOccurred"), {
        description: error.message,
      })
    } else {
      toast.success(t("emailSent"), {
        description: t("resendEmailDesc"),
      })
    }
    setIsLoading(false)
  }

  // Success state - Check your email
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="w-full flex justify-center pt-12 pb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon logo.png" alt="" width={32} height={32} className="h-8 w-8" />
            <Image src="/Lctnships-cropped.png" alt="lctnships" width={140} height={62} className="h-8 w-auto" />
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center">
            {/* Icon */}
            <div className="mb-8 flex items-center justify-center size-24 bg-gray-100 rounded-full text-black">
              <span className="material-symbols-outlined text-5xl">send</span>
            </div>

            <h1 className="text-gray-900 text-center tracking-tight text-[32px] font-bold leading-tight pb-3">
              {t("checkYourEmail")}
            </h1>
            <p className="text-gray-500 text-center text-base font-normal leading-relaxed max-w-[380px] pb-10">
              {t("checkEmailDesc")}
            </p>

            <div className="w-full space-y-6">
              <a
                href="mailto:"
                className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-base font-semibold leading-normal tracking-wide shadow-lg shadow-gray-900/10"
              >
                {t("openEmailApp")}
              </a>
            </div>

            <div className="mt-10 flex flex-col items-center gap-6">
              <p className="text-sm text-gray-500">
                {t("noEmailReceived")}
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-black font-semibold hover:underline underline-offset-4 ml-1 disabled:opacity-50"
                >
                  {t("resend")}
                </button>
              </p>
              <Link
                href="/login"
                className="group flex items-center gap-2 text-gray-900 font-semibold text-sm hover:underline underline-offset-4 decoration-2 transition-all"
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

  // Initial state - Enter email form
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full flex justify-center pt-12 pb-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon logo.png" alt="" width={32} height={32} className="h-8 w-8" />
          <Image src="/Lctnships-cropped.png" alt="lctnships" width={140} height={62} className="h-8 w-auto" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 flex flex-col items-center">
          <h1 className="text-gray-900 text-center tracking-tight text-[32px] font-bold leading-tight pt-2 pb-3">
            {t("forgotPasswordFormTitle")}
          </h1>
          <p className="text-gray-500 text-center text-base font-normal leading-relaxed max-w-[360px] pb-10">
            {t("forgotPasswordFormSubtitle")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="flex flex-col gap-2">
              <label className="px-4">
                <span className="text-gray-900 text-sm font-semibold uppercase tracking-wider">
                  {t("emailLabel")}
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex w-full rounded-full text-gray-900 border border-gray-200 bg-gray-50 h-14 placeholder:text-gray-400 px-6 text-base font-normal transition-all focus:border-black focus:ring-2 focus:ring-black/20 outline-none"
                  placeholder="yourname@studio.com"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 bg-black hover:bg-gray-800 active:scale-[0.98] transition-all text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="truncate">{t("sendResetLinkButton")}</span>
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
