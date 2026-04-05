import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing)

// In-memory rate limit fallback (used when Redis is not available)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const rateLimits = {
  auth: { limit: 5, windowMs: 60000 },    // Stricter limit for auth to prevent brute force
  api: { limit: 100, windowMs: 60000 },
  upload: { limit: 10, windowMs: 60000 },
  stripe: { limit: 20, windowMs: 60000 },
  search: { limit: 200, windowMs: 60000 },
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim()
    if (firstIp && isValidIP(firstIp)) {
      return firstIp
    }
  }

  if (realIp && isValidIP(realIp.trim())) {
    return realIp.trim()
  }

  const userAgent = request.headers.get('user-agent') || ''
  const acceptLang = request.headers.get('accept-language') || ''
  return `fingerprint:${simpleHash(userAgent + acceptLang)}`
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^[a-fA-F0-9:]+$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth')) return rateLimits.auth
  if (pathname.startsWith('/api/upload')) return rateLimits.upload
  if (pathname.startsWith('/api/stripe')) return rateLimits.stripe
  if (pathname === '/api/studios') return rateLimits.search
  return rateLimits.api
}

function checkMemoryRateLimit(key: string, config: { limit: number; windowMs: number }): {
  allowed: boolean
  remaining: number
  reset: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(key)
  }

  const current = rateLimitStore.get(key)

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1, reset: now + config.windowMs }
  }

  current.count++

  if (current.count > config.limit) {
    return { allowed: false, remaining: 0, reset: current.resetTime }
  }

  return { allowed: true, remaining: config.limit - current.count, reset: current.resetTime }
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // RSC prefetch/navigation requests: skip heavy work.
  // These come from Next.js <Link> after the user is already authenticated
  // for the current tab. Running next-intl + supabase.auth.getUser() on every
  // prefetch/RSC fetch turns fast client navigation into serial network calls
  // and can cause 503s when Supabase auth is slow. The server component that
  // renders the RSC payload still does its own auth check via getUser().
  const isRscRequest =
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.nextUrl.searchParams.has('_rsc')
  if (isRscRequest && !pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // API routes: rate limiting + session update only (no locale handling)
  if (pathname.startsWith('/api')) {
    const clientIP = getClientIP(request)
    const config = getRateLimitConfig(pathname)
    const key = `${clientIP}:${pathname.split('/').slice(0, 3).join('/')}`

    let rateLimitResult: { allowed: boolean; remaining: number; reset: number }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { checkRateLimit, getRateLimitType } = await import('@/lib/rate-limit-redis')
        const type = getRateLimitType(pathname)
        const result = await checkRateLimit(clientIP, type)
        rateLimitResult = {
          allowed: result.success,
          remaining: result.remaining,
          reset: result.reset,
        }
      } catch {
        rateLimitResult = checkMemoryRateLimit(key, config)
      }
    } else {
      rateLimitResult = checkMemoryRateLimit(key, config)
    }

    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const response = await updateSession(request)

    response.headers.set('X-RateLimit-Limit', config.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.reset / 1000).toString())

    if (request.method === 'GET') {
      if (pathname === '/api/studios') {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
      } else if (pathname.startsWith('/api/bookings') ||
                 pathname.startsWith('/api/favorites') ||
                 pathname.startsWith('/api/notifications')) {
        response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
      }
    }

    return response
  }

  // For non-API routes: handle locale detection + session update
  // First, let next-intl handle locale detection and redirects
  const intlResponse = intlMiddleware(request)

  // Then update the Supabase session on the response
  // We need to update cookies on the intl response
  const sessionResponse = await updateSession(request)

  // Copy session cookies from the session response to the intl response
  sessionResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    })
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
