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
- **Payments:** Stripe + Stripe Connect (15% platform fee), webhooks at `/api/stripe/webhook`
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
├── layout.tsx                          # Root layout (fonts, metadata)
├── [locale]/                           # Dynamic locale prefix
│   ├── layout.tsx                      # Main app layout with UserProvider
│   ├── (public)/                       # Public pages: homepage, explore, studios, help, blog
│   ├── (auth)/                         # Login, signup (with shared auth layout)
│   ├── (auth-standalone)/              # Forgot/reset password (no shared auth chrome)
│   ├── (dashboard)/                    # Renter dashboard: bookings, favorites, messages, settings
│   ├── (host)/                         # Host dashboard: earnings, payouts, calendar, studios
│   ├── (booking)/                      # Booking flow pages
│   ├── (onboarding)/                   # Host onboarding flow
│   └── host/onboarding/               # Additional onboarding routes
└── api/                                # API routes (not under [locale])
```

Route groups `(public)`, `(auth)`, `(dashboard)`, `(host)`, etc. each have their own layout providing role-specific chrome (navbars, sidebars).

### API routes (`src/app/api/`)
RESTful endpoints: `studios`, `bookings`, `stripe/*`, `auth/*`, `upload`, `conversations`, `payouts`, `notifications`, `equipment`, `reviews`, `calendar`, `credits`, `blog`.

### Middleware (`src/middleware.ts`)
Runs on every request (except static assets). For API routes: rate limiting + Supabase session refresh. For page routes: next-intl locale handling + session refresh.

### Supabase clients (`src/lib/supabase/`)
- `client.ts` — browser-side singleton (`createBrowserClient`)
- `server.ts` — server-side with cookie management (`createServerClient`)
- `middleware.ts` — session update helper for middleware
- Admin client uses `SUPABASE_SERVICE_ROLE_KEY` for elevated operations

### Database
Types generated to `src/types/database.types.ts`. Migrations in `supabase/migrations/`. Key tables: `users`, `studios`, `bookings`, `favorites`, `conversations`, `messages`, `reviews`, `credits`, `payouts`, `notifications`, `calendar_availability`, `equipment`, `blog_posts`.

### i18n
Translation files in `messages/{locale}.json`. Use `next-intl` `useTranslations()` hook in client components and `getTranslations()` in server components. Default locale is `nl` (Dutch). Locale config in `src/i18n/config.ts`, routing in `src/i18n/routing.ts`.

### Components (`src/components/`)
- `ui/` — shadcn/ui base components
- Feature directories: `auth/`, `booking/`, `studios/`, `dashboard/`, `marketplace/`, `credits/`, `layout/`, `shared/`
- `providers/` — context providers (user, theme)

### Environment variables
See `.env.example`. Required: Supabase (URL, anon key, service role key), Stripe (secret, publishable, webhook secret), Google Places API key, Encryption key, Resend API key. Optional: Upstash Redis for rate limiting.
