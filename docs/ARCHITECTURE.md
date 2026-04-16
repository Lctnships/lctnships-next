# Architecture — Target State

**Versie:** 2026-04-15
**Status:** target (huidig = monoliet, target = post-cutover; zie [MIGRATION-PLAN.md](./MIGRATION-PLAN.md))
**Eigenaar:** MacAndrew Holdings B.V. (KVK 96734647)

---

## Project

lctnships is een two-sided marketplace voor het verhuren van creatieve studios (muziekstudios, fotostudios, rehearsal rooms, podcasting). Hosts bieden, renters boeken per uur of in vaste blokken.

**Business model:** 15% platform-commissie. Renter betaalt 100%, host ontvangt 85% via Stripe Connect transfer.

**Booking-types:** instant-book (renter betaalt direct) of op-aanvraag (host moet eerst goedkeuren binnen 48u, daarna 72u betaaldeadline).

---

## Doelarchitectuur

```
lctnships/                                    ← één Turborepo
├── apps/
│   ├── web/         → lctnships.com         ← marketing + auth callbacks + canonical webhooks
│   ├── host/        → host.lctnships.com    ← host dashboard
│   └── renter/      → app.lctnships.com     ← renter booking-app
├── packages/
│   ├── shared/                              ← types, constants, format helpers
│   ├── ui/                                  ← shadcn componenten + Tailwind preset
│   ├── supabase/                            ← clients (browser/server/admin/middleware) + types
│   └── stripe/                              ← Connect + Checkout helpers + fee math
├── supabase/
│   └── migrations/                          ← 001..028 (intact uit huidige repo)
├── tests/                                   ← Playwright E2E (33 baseline)
└── docs/                                    ← MIGRATION-PLAN, ROADMAP, TICKETS, REPORT
```

**Verschil met huidige staat:** alleen de `apps/` + `packages/` indeling. Database, migraties, RLS-policies, Stripe-config, tests blijven 1:1.

---

## Tech Stack

| Layer | Technologie | Notes |
|---|---|---|
| Monorepo | Turborepo | npm workspaces, geen pnpm voor consistentie met huidige `package-lock.json` |
| Framework | Next.js 16 (App Router) | huidige versie, niet downgraden naar 15 |
| Language | TypeScript | `strict: false` zoals in huidige `tsconfig.json` |
| Database | Supabase PostgreSQL | project `ytmkmiofoluespwysfxa`, region `eu-west-1` |
| Auth | Supabase Auth | OAuth (Google) + email/password, JWT-cookies |
| Storage | Supabase Storage | studio foto's, avatars |
| Realtime | Supabase Realtime | berichten + booking-updates |
| Payments | Stripe Connect | manual capture instant-book → confirmed; on-request flow heeft eigen approve→pay timing |
| Styling | Tailwind CSS v4 | `@theme` syntax |
| State (client) | Zustand + React Context | UserProvider voor auth-state |
| Data fetching | Supabase client + React `cache()` | per-request dedupe via `getUser()` / `getProfile()` |
| Email | Resend + React Email | templates in `apps/web/src/emails` (kan naar `packages/emails` later) |
| Cron | Vercel Cron (Pro) | extension-reminders elke minuut, booking-expiry elke 15 min |
| Hosting | Vercel | drie projects → drie subs |
| DNS | Cloudflare | TTL 300 voor cutover-week |
| Observability | Sentry + Vercel Analytics | Core Web Vitals tracking |

---

## Database Schema (current — blijft)

| Tabel | Rol | RLS samenvatting |
|---|---|---|
| `users` | profiles + 9 publieke kolommen, rest service-role only | `users` SELECT alleen voor 9 safe cols (mig 011+018) |
| `studios` | host's listings | publiek SELECT als published, host CRUD |
| `studio_images`, `studio_amenities` | metadata | momenteel 0 policies → migratie 029 nodig |
| `studio_availability`, `studio_blocked_dates` | beschikbaarheid + iCal-import | host beheert eigen |
| `bookings` | core | column-grants beperken UPDATE tot operationele velden (mig 011) |
| `booking_equipment`, `booking_services`, `booking_extensions` | line-items met snapshot-prijzen | renter+host SELECT eigen, service-role write |
| `services` | host's add-ons | publiek SELECT actieve, host CRUD eigen (mig 027) |
| `conversations`, `conversation_participants`, `messages` | chat | peer-view via SECURITY DEFINER (mig 025) |
| `reviews`, `favorites`, `notifications` | user-owned | self-only |
| `credits`, `user_credits`, `credit_transactions`, `credit_packages` | credit-systeem | service-role schrijft, user leest eigen |
| `payouts`, `transactions` | financieel | host SELECT eigen payouts; transactions 0 policies → mig 029 |
| `projects` (+ subtables: `project_members`, `project_storyboards`, `project_shotlist`, `project_files`, `project_notes`, `project_locations`, `project_moodboard_items`) | renter's creatieve projecten | owner CRUD |
| `portfolio_items` | profile portfolio | owner CRUD, publiek SELECT (mig 023) |
| `processed_webhook_events` | Stripe idempotency | service-role only, status (processing/done/failed) (mig 024) |
| `equipment` | huurbare hardware per studio | publiek SELECT, host CRUD |
| `payment_methods` | renter saved cards | self-only |
| `user_sessions` | device tracking | self-only (mig 005) |

**Open RLS-werk (vóór launch):** migratie 029 voor `studio_images`, `studio_amenities`, `transactions` policies.

---

## Booking-flow (current — blijft)

```
                ┌─────────────────────────┐
                │  Renter klikt "Boek"    │
                └────────────┬────────────┘
                             │
              studio.is_instant_book ?
                             │
            ┌────────────────┴────────────────┐
            │ true                       false│
            ▼                                 ▼
   ┌────────────────┐              ┌──────────────────────┐
   │ POST /api/     │              │ POST /api/bookings   │
   │ bookings       │              │ status=pending_      │
   │ status=pending │              │ approval             │
   │ payment=       │              │ request_expires_at = │
   │ awaiting_pay   │              │ now + 48h            │
   └────────┬───────┘              └──────────┬───────────┘
            │                                 │
            ▼                                 ▼
   ┌────────────────┐              ┌──────────────────────┐
   │ Stripe Checkout│              │ Host → Accept/Reject │
   └────────┬───────┘              └──────────┬───────────┘
            │                                 │ accept
            │                                 ▼
            │                      ┌──────────────────────┐
            │                      │ status=approved      │
            │                      │ payment_deadline =   │
            │                      │ now + 72h            │
            │                      └──────────┬───────────┘
            │                                 │
            │                                 ▼
            │                      ┌──────────────────────┐
            │                      │ Renter → /pay        │
            │                      │ Stripe Checkout      │
            │                      └──────────┬───────────┘
            │                                 │
            └─────────────┬───────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │ Stripe webhook       │
              │ status=confirmed     │
              │ payment_status=paid  │
              └──────────────────────┘
```

**Auto-expiry cron** (`/api/cron/booking-expiry`, elke 15 min):
- `pending_approval` past 48u → `expired`
- `approved` past 72u → `expired`

---

## Key Business Rules

1. **Hosts zien ALLEEN bookings voor eigen studios** — RLS enforced
2. **Renters zien ALLEEN eigen bookings** — RLS enforced
3. **15% commissie** wordt server-side berekend bij booking-creation, **opnieuw** bij Stripe checkout (defense in depth)
4. **Op-aanvraag bookings lopen geen geld vast** voordat de host accepteert
5. **Instant-book bookings betalen direct** via Stripe Checkout (manual capture later na confirm wordt niet gedaan — current flow is auto-capture)
6. **Cancel-flow:** Stripe refund eerst (bron-of-truth = PaymentIntent), dan DB update via service-client
7. **Refund-percentage** uit `studio.cancellation_policy` (flexible/moderate/strict)
8. **Webhook idempotency:** elk Stripe event krijgt rij in `processed_webhook_events` met status='processing' → 'done' bij succes
9. **Studio's** moeten `is_published=true` AND `status='published'` om in zoekresultaten te verschijnen
10. **Booking-duur** komt uit `getAvailableDurations(studio)` — single source of truth tussen studio-detail, session, checkout

---

## Cross-app Sessie Architectuur

Cookies geset met `domain=.lctnships.com` zodat sessie meegaat tussen `lctnships.com`, `host.lctnships.com`, `app.lctnships.com`.

```ts
// packages/supabase/src/server.ts (target)
createServerClient(url, key, {
  cookies: { /* request/response binding */ },
  cookieOptions: {
    domain: process.env.NODE_ENV === 'production' ? '.lctnships.com' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
})
```

---

## Webhook & Cron Canonical URLs

Alle Stripe webhooks + cron endpoints **blijven** op `apps/web` (canonical):
- `https://www.lctnships.com/api/stripe/webhook`
- `https://www.lctnships.com/api/cron/extension-reminders`
- `https://www.lctnships.com/api/cron/booking-expiry`

Reden: webhook URL wisselen tijdens cutover = payments missen. Niet doen.

---

## Environment Variables

Per Vercel project (web, host, renter) zelfde set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ytmkmiofoluespwysfxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_SITE_URL=https://www.lctnships.com
NEXT_PUBLIC_HOST_URL=https://host.lctnships.com
NEXT_PUBLIC_RENTER_URL=https://app.lctnships.com

# Email
RESEND_API_KEY=re_...

# Cron auth
CRON_SECRET=...

# Geo
GOOGLE_PLACES_API_KEY=...

# Encryption
ENCRYPTION_KEY=...

# Rate limiting
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Commands (target)

```bash
# Development
turbo dev                          # alle apps parallel
turbo dev --filter=host            # alleen host
turbo dev --filter=renter          # alleen renter

# Build
turbo build                        # alle apps
turbo build --filter=web           # alleen marketing

# Quality
turbo lint
turbo typecheck
turbo test                         # Playwright per app

# Database
supabase db push                   # migrations naar remote
supabase gen types typescript --linked > packages/supabase/src/types/database.types.ts

# Git flow
git checkout main && git pull --rebase
git checkout -b feat/LCN-XXX-...
# work + tests + commit
git push -u origin feat/LCN-XXX-...
gh pr create --base main
```

---

## Airbnb-geïnspireerde Keuzes (toegepast)

| Airbnb pattern | lctnships toepassing |
|---|---|
| Host/Guest scheiding | `apps/host` + `apps/renter` met aparte UI + bundle |
| Service blocks per domain | `packages/{shared,ui,supabase,stripe}` |
| Stripe Connect 85/15 | Geïmplementeerd in `/api/stripe/*` |
| Geospatial search | PostGIS — gepland post-launch (LCN-200) |
| Realtime updates | Supabase Realtime voor messages |
| RLS data-isolatie | 36 lctnships-tabellen RLS aan, policies geverifieerd via `rls_state()` |
| Availability lock | Slot wordt geblokt bij `pending_approval` + `pending` |

---

## Bewust Niet (anti-pattern detectie)

| Niet doen | Reden |
|---|---|
| Aparte microservices voor search/payments/messaging | <500 studios — premature optimalisatie |
| Eigen GraphQL gateway | Supabase + Next API routes dekken het |
| Native mobile v1 | Web responsive volstaat, mobiel = v2 |
| Supabase region migratie naar eu-central | 20ms latency-verschil, niet de moeite |
| Database splitsen (host-DB / renter-DB) | RLS doet de scheiding al op rij-niveau |
| Real-time bidding op slots | Geen marktplaats-dynamiek nodig |

---

## Volgende Audit-Punten

Na launch:
- Migration 029: RLS policies voor `studio_images`, `studio_amenities`, `transactions`
- LCN-200: PostGIS geo-search als studio-aantal > 500
- LCN-201: Advisory locks als double-booking incidenten optreden
