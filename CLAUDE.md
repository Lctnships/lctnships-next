# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lctnships is a creative studio rental marketplace (like Airbnb for studios). Hosts list studios; renters browse, book, and pay. Built with Next.js 16 (App Router), React 19, TypeScript, Supabase, and Stripe.

## Commands

```bash
npm run dev          # Start dev server (default port 3000)
npm run build        # Production build (also runs type checking)
npm run lint         # ESLint (flat config, ESLint 9)
npx tsc --noEmit     # Type check without emitting
npx playwright test  # Run all E2E tests (starts dev server on port 3002)
npx playwright test tests/smoke.spec.ts --project=chromium  # Run single test file in one browser
```

## Tech Stack

- **Framework:** Next.js 16 with App Router, Turbopack, React 19
- **Language:** TypeScript (strict mode OFF — `"strict": false` in tsconfig)
- **Styling:** Tailwind CSS v4 (new `@theme` syntax), shadcn/ui (new-york style)
- **Database:** Supabase (PostgreSQL) — no ORM, raw Supabase client queries
- **Auth:** Supabase Auth (OAuth + email/password), session managed via middleware cookies
- **Payments:** Stripe + Stripe Connect (15% platform fee, 85/15 split — renter pays listing price, no visible service fee). Webhooks at `/api/stripe/webhook`. Cancel flow is atomic (Stripe refund first → DB update → emails). `refund_application_fee: true` on all refunds.
- **i18n:** next-intl — locales: `nl` (default), `en`, `es`, `fr`, `de`
- **Email:** Resend with React Email templates in `src/emails/`
- **State:** Zustand (client), React Context via UserProvider (auth user)
- **Rate Limiting:** Upstash Redis (primary) with in-memory fallback, configured in middleware
- **Testing:** Playwright (Chromium, Firefox, WebKit, Mobile Chrome)
- **Deployment:** Vercel

## Architecture

### Path alias
`@/*` maps to `./src/*` — all imports use `@/` prefix.

### Route structure (`src/app/`)
```
src/app/
├── layout.tsx                          # Root layout (fonts, metadata, OG tags)
├── sitemap.ts                          # Dynamic sitemap (static + studios + blog × 5 locales)
├── robots.ts                           # Robots directives (blocks /api, auth, dashboard paths)
├── [locale]/                           # Dynamic locale prefix
│   ├── layout.tsx                      # Main app layout with UserProvider + hreflang alternates
│   ├── (public)/                       # Public pages: homepage, explore, studios, help, blog
│   ├── (auth)/                         # Login, signup (with shared auth layout)
│   ├── (auth-standalone)/              # Forgot/reset password (no shared auth chrome)
│   ├── (dashboard)/                    # Renter dashboard + loading.tsx skeleton
│   ├── (host)/                         # Host dashboard + loading.tsx skeleton
│   ├── (booking)/                      # Booking flow pages
│   ├── (onboarding)/                   # Host onboarding flow
│   └── host/onboarding/               # Additional onboarding routes
└── api/                                # API routes (not under [locale])
```

Route groups `(public)`, `(auth)`, `(dashboard)`, `(host)`, etc. each have their own layout providing role-specific chrome (navbars, sidebars). `(dashboard)` and `(host)` have `loading.tsx` skeletons for navigation feedback.

### API routes (`src/app/api/`)
RESTful endpoints: `studios`, `bookings`, `stripe/*`, `auth/*`, `upload`, `conversations`, `payouts`, `notifications`, `equipment`, `reviews`, `calendar`, `credits`, `blog`.

### Middleware (`src/middleware.ts`)
Runs on every request (except static assets, sitemap.xml, robots.txt). For API routes: rate limiting + Supabase session refresh. For page routes: next-intl locale handling + session refresh. **RSC/prefetch requests** still go through next-intl (needed for locale routing) but skip `updateSession` (the expensive `auth.getUser()` call) for faster navigation.

### Supabase clients (`src/lib/supabase/`)
- `client.ts` — browser-side singleton (`createBrowserClient`)
- `server.ts` — server-side with cookie management (`createServerClient`)
- `middleware.ts` — session update helper for middleware
- Admin client uses `SUPABASE_SERVICE_ROLE_KEY` for elevated operations

### Database
Types generated to `src/types/database.types.ts` (blocked from hand-edit by a PreToolUse hook). Migrations in `supabase/migrations/`. Key tables: `users`, `studios`, `bookings`, `favorites`, `conversations`, `messages`, `reviews`, `credits`, `payouts`, `notifications`, `calendar_availability`, `equipment`, `blog_posts`, `projects`.

Migration conventions:
- `bookings.requires_manual_payout_reversal` flags refunds issued after a host payout went out — operator must handle manually.
- Composite indexes on `(renter_id, status, start_datetime)`, `(host_id, status, start_datetime)` etc. live in migration 006.

### Shared lib helpers
- `src/lib/auth.ts` — `getUser()` + `getProfile()` wrapped in `React.cache()` for per-request dedupe. Use these in server components instead of calling `supabase.auth.getUser()` directly.
- `src/lib/seo.ts` — `SITE_URL`, `SITE_NAME`, `buildAlternateLanguages()` for hreflang.

### i18n
Translation files in `messages/{locale}.json`. Use `next-intl` `useTranslations()` hook in client components and `getTranslations()` in server components. Default locale is `nl` (Dutch). Locale config in `src/i18n/config.ts`, routing in `src/i18n/routing.ts`.

### Components (`src/components/`)
- `ui/` — shadcn/ui base components
- Feature directories: `auth/`, `booking/`, `studios/`, `dashboard/`, `marketplace/`, `credits/`, `layout/`, `shared/`
- `providers/` — context providers (user, theme)

### Environment variables
See `.env.example`. Required: Supabase (URL, anon key, service role key), Stripe (secret, publishable, webhook secret), Google Places API key, Encryption key, Resend API key, `NEXT_PUBLIC_SITE_URL` (used for metadataBase, sitemap, robots, OG tags — set to `https://www.lctnships.com` on Vercel). Optional: Upstash Redis for rate limiting.
