import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { parseUserAgent } from "@/lib/utils/parse-user-agent"
import { logger } from "@/lib/logger"
import { SITE_URL } from "@/lib/seo"
import { validateRedirectPath } from "@/lib/redirect"

// Sanitize string input to prevent XSS and SQL injection
function sanitizeString(input: unknown): string | null {
  if (typeof input !== "string") return null
  // Remove HTML tags, trim, and limit length
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim()
    .slice(0, 255) || null
}

// Validate URL is a safe avatar URL
function sanitizeAvatarUrl(input: unknown): string | null {
  if (typeof input !== "string") return null
  try {
    const url = new URL(input)
    // Only allow HTTPS URLs from known providers
    const allowedHosts = [
      "lh3.googleusercontent.com",
      "googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "graph.facebook.com",
      "avatars.githubusercontent.com",
      "pbs.twimg.com",
    ]
    if (url.protocol === "https:" && allowedHosts.some(host => url.hostname.endsWith(host))) {
      return url.toString()
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Get the correct origin for redirects, handling Vercel's forwarded host
function getOrigin(request: Request): string {
  const { origin } = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"

  if (forwardedHost) {
    // Validate forwardedHost against the configured SITE_URL to prevent host header injection
    try {
      const siteHost = new URL(SITE_URL).host
      if (forwardedHost === siteHost) {
        return `${forwardedProto}://${forwardedHost}`
      }
      // Also allow Vercel preview URLs (*.vercel.app)
      if (forwardedHost.endsWith(".vercel.app")) {
        return `${forwardedProto}://${forwardedHost}`
      }
      logger.warn("Rejected untrusted x-forwarded-host", { forwardedHost, siteHost })
    } catch {
      // Invalid SITE_URL, fall through to origin
    }
  }
  return origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectParam = searchParams.get("redirect") || "/dashboard"
  const redirect = validateRedirectPath(redirectParam)
  const origin = getOrigin(request)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      logger.error("Auth callback: code exchange failed", error.message)
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }

    if (!data.user) {
      logger.error("Auth callback: no user returned after code exchange")
      return NextResponse.redirect(`${origin}/login?error=auth`)
    }

    // Check if user profile exists, create if not
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle()

    if (!existingProfile) {
      // Sanitize user metadata before inserting
      const fullName = sanitizeString(
        data.user.user_metadata.full_name || data.user.user_metadata.name
      )
      const avatarUrl = sanitizeAvatarUrl(data.user.user_metadata.avatar_url)

      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        avatar_url: avatarUrl,
        user_type: "renter",
      })

      if (profileError) {
        logger.error("Auth callback: profile creation failed", profileError.message)
      }
    }

    // Record this session for device tracking
    try {
      const headersList = await headers()
      const userAgent = headersList.get("user-agent") || ""
      const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                        headersList.get("x-real-ip") || null

      const parsed = parseUserAgent(userAgent)

      await supabase.from("user_sessions").insert({
        user_id: data.user.id,
        device_name: parsed.deviceName,
        device_type: parsed.deviceType,
        browser: `${parsed.browser} on ${parsed.os}`,
        os: parsed.os,
        ip_address: ipAddress,
        user_agent: userAgent.slice(0, 500),
        is_current: true,
      })
    } catch (sessionError) {
      // Non-critical: don't block login if session tracking fails
      logger.error("Auth callback: session tracking failed", sessionError)
    }

    return NextResponse.redirect(`${origin}${redirect}`)
  }

  logger.error("Auth callback: no code parameter in URL")
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
