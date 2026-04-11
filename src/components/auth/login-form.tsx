"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { validateRedirectPath } from "@/lib/redirect"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/routing"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = validateRedirectPath(searchParams.get("redirect"))
  const authError = searchParams.get("error")
  const supabase = createClient()
  const t = useTranslations("Auth")

  useEffect(() => {
    if (authError === "auth") {
      toast.error(t("loginFailed"), {
        description: t("loginFailedAuth"),
      })
    }
  }, [authError, t])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let description = error.message
      if (error.message === "Invalid login credentials") {
        description = t("invalidCredentials")
      } else if (error.message === "Email not confirmed") {
        description = t("emailNotConfirmed")
      }
      toast.error(t("loginFailed"), {
        description,
      })
      setIsLoading(false)
      return
    }

    toast.success(t("welcomeBackToast"))
    router.refresh()
    router.push(redirect)
  }

  const handleGoogleLogin = async () => {
    setIsSocialLoading("google")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      setIsSocialLoading(null)
      toast.error(t("googleLoginFailed"), {
        description: error.message,
      })
    }
  }

  return (
    <div className="w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <Image src="/icon logo.png" alt="" width={32} height={32} className="h-8 w-8" />
        <Image src="/Lctnships-cropped.png" alt="lctnships" width={140} height={62} className="h-8 w-auto" />
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t("welcomeBack")}</h1>
        <p className="text-gray-500">{t("loginSubtitle")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-14 px-6 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-14 px-6 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-black hover:underline font-medium"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-black text-white rounded-full font-bold text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {t("loginButton")}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">{t("orContinueWith")}</span>
        </div>
      </div>

      {/* Social Login - Google only */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSocialLoading !== null}
        className="w-full h-14 border border-gray-200 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSocialLoading === "google" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Google
      </button>

      {/* Sign up link */}
      <p className="text-center mt-8 text-gray-500">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-black font-bold hover:underline">
          {t("register")}
        </Link>
      </p>
    </div>
  )
}
