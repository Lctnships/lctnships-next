"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const supabase = createClient()

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
        description = "Het e-mailadres of wachtwoord is onjuist."
      } else if (error.message === "Email not confirmed") {
        description = "Bevestig je e-mailadres voordat je inlogt. Controleer je inbox."
      }
      toast.error("Inloggen mislukt", {
        description,
      })
      setIsLoading(false)
      return
    }

    toast.success("Welkom terug!")
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
      toast.error("Google login mislukt", {
        description: error.message,
      })
    }
  }

  const handleAppleLogin = async () => {
    setIsSocialLoading("apple")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (error) {
      setIsSocialLoading(null)
      toast.error("Apple login mislukt", {
        description: error.message,
      })
    }
  }

  return (
    <div className="w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-3 mb-8">
        <div className="size-12 rounded-full bg-[#0f49bd] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
        </div>
        <span className="text-2xl font-extrabold tracking-tight">lcntships</span>
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
        <p className="text-gray-500">Sign in to continue to your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-14 px-6 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#0f49bd] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-14 px-6 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#0f49bd] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#0f49bd] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-[#0f49bd] text-white rounded-full font-bold text-base hover:bg-[#0d3ea0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Sign in
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSocialLoading !== null}
          className="flex-1 h-14 border border-gray-200 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={isSocialLoading !== null}
          className="flex-1 h-14 border border-gray-200 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSocialLoading === "apple" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          )}
          Apple
        </button>
      </div>

      {/* Sign up link */}
      <p className="text-center mt-8 text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#0f49bd] font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
