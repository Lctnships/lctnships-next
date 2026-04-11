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
- **Payments:** Stripe + Stripe Connect (15% platform fee, 85/15 split — renter pays listing price, no visible service fee). Webhooks at `/api/stripe/webhook`. Cancel flow is atomic (Stripe refund first → DB update → emails). `refund_application_fee: true` on all refunds. Webhook is idempotent via `processed_webhook_events` table.
- **i18n:** next-intl — locales: `nl` (default), `en`, `es`, `fr`, `de`. Use `src/lib/format-locale.ts` helpers for dates/currency instead of hardcoding `nl-NL`.
- **Email:** Resend with React Email templates in `src/emails/`
- **State:** Zustand (client), React Context via UserProvider (auth user)
- **Rate Limiting:** Upstash Redis (primary) with in-memory fallback, configured in middleware
- **Cron:** Vercel Cron (Pro plan) — see `vercel.json`
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
│   ├── (booking)/                      # Booking flow pages (includes bookings/[id]/extend)
│   ├── (onboarding)/                   # Host onboarding flow
│   └── host/onboarding/               # Additional onboarding routes
└── api/                                # API routes (not under [locale])
```

Route groups `(public)`, `(auth)`, `(dashboard)`, `(host)`, etc. each have their own layout providing role-specific chrome (navbars, sidebars). `(dashboard)` and `(host)` have `loading.tsx` skeletons for navigation feedback.

### API routes (`src/app/api/`)
- **`auth/*`** — callback, sessions (uses `src/lib/redirect.ts` `validateRedirectPath` for open-redirect prevention)
- **`bookings/`** — create, list
- **`bookings/[id]/`** — detail, reschedule (same-duration constraint), confirm, cancel (atomic Stripe refund → DB), extend
- **`calendar/import/[studioId]`** — iCal import for Wix + MeetingPackage, SSRF-protected (HTTPS + host allowlist + private IP block)
- **`calendar/ical/[studioId]`** — public iCal export of the studio's bookings
- **`conversations/`, `messages/`** — chat
- **`credits/`, `checkout/credits/`** — credit purchase flow
- **`cron/extension-reminders`** — Vercel cron (runs every minute on Pro plan), sends 30-min and 10-min extension reminder notifications + emails. Protected by `CRON_SECRET` Bearer auth.
- **`equipment/`** — host equipment inventory CRUD
- **`favorites/`, `notifications/`, `reviews/`** — user-owned lists
- **`payouts/`** — host payout list + manual trigger
- **`places/geocode`** — Google Places proxy
- **`sessions/`, `sessions/ensure`, `sessions/[id]`** — device session tracking. `POST /api/sessions` derives `ip_address` server-side, never trusts client body.
- **`stripe/webhook`** — Stripe webhook handler. Node runtime pin, signature verified via `constructEvent`, **idempotent via `processed_webhook_events` unique insert**. Handles `checkout.session.completed` (booking + credit + extension payments), `checkout.session.expired`, `payment_intent.payment_failed`, `transfer.created`, `payout.failed`, `charge.dispute.created`.
- **`stripe/checkout`, `stripe/create-checkout`** — booking checkout (verifies host `charges_enabled` before building `transfer_data`)
- **`stripe/extension-checkout`** — booking extension payment
- **`stripe/connect`, `stripe/create-connect-account`** — host onboarding (atomic upsert against unique `stripe_account_id` constraint to prevent orphan accounts on double-click)
- **`stripe/create-payout`, `stripe/balance`** — payout management (idempotency key does NOT include `Date.now()`)
- **`studios/`, `studios/[id]/`, `studios/[id]/images`** — studios CRUD. POST images validates `image_url` against Supabase Storage host allowlist (SSRF).
- **`studios/blocked-dates/`** — manual + iCal-sourced blocked dates
- **`upload/`** — file uploads to Supabase Storage (type/size/path validation)
- **`users/profile`, `users/settings`, `users/password`, `users/bank-account`** — user account management. **All reads of sensitive columns use the admin client** (see Security model below).

### Middleware (`src/middleware.ts`)
Runs on every request (except static assets, sitemap.xml, robots.txt). For API routes: rate limiting + Supabase session refresh. For page routes: next-intl locale handling + session refresh. **RSC/prefetch requests** still go through next-intl (needed for locale routing) but skip `updateSession` (the expensive `auth.getUser()` call) for faster navigation.

### Supabase clients (`src/lib/supabase/`)
- `client.ts` — browser-side singleton (`createBrowserClient`)
- `server.ts` — server-side with cookie management (`createServerClient`). Exports `createClient()` (user-scoped) and `createServiceClient()` (elevated).
- `admin.ts` — `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY`. Throws if env vars missing (no silent placeholder fallback). **Use this for any read/write of sensitive user columns** — see Security model.
- `middleware.ts` — session update helper for middleware

### Database
Types generated to `src/types/database.types.ts` (blocked from hand-edit by a PreToolUse hook — edit manually only when adding newly-migrated columns Claude knows about). Migrations in `supabase/migrations/`.

**Key tables:** `users`, `studios`, `studio_images`, `studio_availability`, `studio_blocked_dates`, `bookings`, `booking_equipment`, `booking_extensions`, `booking_extension_items`, `favorites`, `conversations`, `conversation_participants`, `messages`, `reviews`, `credits`, `user_credits`, `credit_transactions`, `credit_packages`, `transactions`, `payouts`, `notifications`, `equipment`, `blog_articles`, `projects` (+ `project_*` sub-tables), `user_sessions`, `user_settings`, `processed_webhook_events`.

**Migration conventions:**
- `bookings.requires_manual_payout_reversal` flags refunds issued after a host payout went out — operator must handle manually.
- Composite indexes on `(renter_id, status, start_datetime)`, `(host_id, status, start_datetime)` etc. live in migration 006. Extra indexes for messaging + favorites in 010.
- Migrations 011–018 are the security audit closeout (see Security model).
- `studios.booking_mode` + `studios.booking_blocks` (migration 014) support fixed-duration block pricing. When `booking_mode = 'fixed_blocks'`, `booking_blocks` is a JSONB array of `{duration_hours, price, sort_order}` objects. The booking checkout flow and `/api/bookings` price verification must match the requested duration against a block.
- `studios.allow_extensions` + `booking_extensions` + `booking_extension_items` (migration 015) support renter-initiated session extensions. 15% platform fee applies. Extension pricing is computed in `/api/bookings/[id]/extend` and charged via Stripe in `/api/stripe/extension-checkout`.
- `studios.wix_calendar_url` (migration 019) + `studios.meetingpackage_calendar_url` (migration 020) store external iCal URLs for one-way import. Import happens in `/api/calendar/import/[studioId]` and creates `studio_blocked_dates` rows.

### Security model

**See `docs/SECURITY-REPORT.md` for the full 2026-04-11 audit closeout.** Key invariants:

1. **Column-level grants on `users`** (migrations 011 + 018). The `authenticated` and `anon` Postgres roles can only SELECT the 9 safe public-profile columns: `id, full_name, avatar_url, bio, location, user_type, is_verified, created_at, updated_at`. Reading anything else (`phone`, `email`, `stripe_account_id`, `stripe_customer_id`, `bank_*`, `two_factor_enabled`, notification prefs, `onboarding_complete`) via the user-scoped client returns `permission denied`. **Use `createAdminClient()` from `@/lib/supabase/admin` after verifying identity with `getUser()` first.** This pattern is already applied in `/api/stripe/*`, `/api/users/*`, `/api/payouts`, `/api/bookings/[id]`, `host/payouts/page.tsx`, `host/bookings/[id]/page.tsx`, and the security settings pages.

2. **Column-level grants on `bookings`** (migration 011). Authenticated users cannot UPDATE financial or ownership columns (`total_amount`, `total_price`, `service_fee`, `host_payout`, `equipment_total`, `credits_used`, `renter_id`, `host_id`, `user_id`, `studio_id`, `stripe_*`, `paid_at`, `payment_status`, `payment_method`). Only operational columns are grantable: `status`, `notes`, `special_requests`, `production_type`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `start_datetime`, `end_datetime`, `total_hours`, `start_time`, `end_time`, `updated_at`. Server flows that need to mutate financial fields (webhook, cancel, checkout) use the service client.

3. **Webhook idempotency.** `/api/stripe/webhook` inserts `event.id` into `processed_webhook_events` as the first action; unique-violation short-circuits the handler. Prevents duplicate credits / duplicate transaction rows on Stripe at-least-once retries.

4. **SSRF protection on user-submitted URLs.** Avatar URLs, studio image URLs, and iCal import URLs all go through the same pattern: `new URL()` parse → HTTPS-only → host allowlist (ending match) → private IP block (`localhost`, `127.`, `10.`, `192.168.`, `169.254.`, `172.16–31.`, `::1`, `fe80:`) → 10-second `AbortSignal.timeout` on outbound fetch. See `/api/calendar/import/[studioId]/route.ts` for the canonical example.

5. **Booking creation price recalc.** `/api/bookings/POST` recomputes subtotal server-side from `studio.price_per_hour` (with `hourly_rate` as legacy fallback) or the matching `booking_blocks` entry, then compares against the client-supplied total with a 2% tolerance. The Stripe checkout routes (`/api/stripe/checkout`, `/api/stripe/create-checkout`) ALSO recalc from the DB row and overwrite the booking's financial fields via admin client before creating the Stripe session.

6. **Stripe webhook handles `charge.dispute.created` and `payout.failed`** — these flag `bookings.requires_manual_payout_reversal` and update payout status respectively, so ops sees disputes before the next payout runs.

7. **Open-redirect prevention.** `src/lib/redirect.ts` `validateRedirectPath()` is used in both the OAuth callback and the email/password login form to prevent `?redirect=https://evil.com` phishing.

### Shared lib helpers
- `src/lib/auth.ts` — `getUser()` + `getProfile()` wrapped in `React.cache()` for per-request dedupe. Use these in server components instead of calling `supabase.auth.getUser()` directly.
- `src/lib/seo.ts` — `SITE_URL`, `SITE_NAME`, `buildAlternateLanguages()` for hreflang.
- `src/lib/format-locale.ts` — `bcp47()`, `formatCurrency()`, `formatDate()`, `formatTime()`, `formatNumber()`. Use with `useLocale()` instead of hardcoding `"nl-NL"`.
- `src/lib/redirect.ts` — `validateRedirectPath()` open-redirect validator.
- `src/lib/stripe.ts` — `getStripe()` lazy singleton + `PLATFORM_FEE_PERCENT = 15` + checkout helpers. `src/lib/stripe/config.ts` re-exports the same instance as a nullable `stripe` for legacy import paths.
- `src/lib/credits.ts` — credit balance / grant / spend helpers. `addCredits()` accepts an optional supabase client param so the webhook can pass its service client (migrations 011 + 018 restricted `user_credits` / `credit_transactions` to `service_role` only).

### i18n
Translation files in `messages/{locale}.json`. Use `next-intl` `useTranslations()` hook in client components and `getTranslations()` in server components. Default locale is `nl` (Dutch). Locale config in `src/i18n/config.ts`, routing in `src/i18n/routing.ts`. The host dashboard pages all wire up to their namespaces — `HostDashboard`, `HostEarnings`, `HostCalendar`, `HostEquipment`, `HostBookingDetail`, `HostStudios`. Renter dashboard uses `Dashboard`, `Bookings`, `Messages`, `Favorites`, `Settings`, `Notifications`.

### Components (`src/components/`)
- `ui/` — shadcn/ui base components
- Feature directories: `auth/`, `booking/`, `studios/`, `dashboard/`, `marketplace/`, `credits/`, `layout/`, `shared/`
- `providers/` — context providers (user, theme)

### Environment variables
See `.env.example`. Required: Supabase (URL, anon key, service role key), Stripe (secret, publishable, webhook secret), Google Places API key, Encryption key, Resend API key, `NEXT_PUBLIC_SITE_URL` (used for metadataBase, sitemap, robots, OG tags — set to `https://www.lctnships.com` on Vercel), `CRON_SECRET` (Bearer token the Vercel cron sends to `/api/cron/extension-reminders`). Optional: Upstash Redis for rate limiting.

### Cron jobs (`vercel.json`)
- `/api/cron/extension-reminders` — runs every minute (Vercel Pro plan required). Sends notification + email 30 minutes and 10 minutes before a confirmed booking ends, inviting the renter to extend the session. Bearer-authed via `CRON_SECRET`.
