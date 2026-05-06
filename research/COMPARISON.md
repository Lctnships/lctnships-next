# COMPARISON.md — lctnships vs Movinin vs Sharetribe

**Doel:** Onze stack en architectuur naast twee bewezen open-source marktplaatsen leggen, om concrete beslissingen te kunnen nemen over (a) waar we kunnen leren, (b) waar we al sterker zijn, en (c) wat we ECHT moeten implementeren om te schalen.

**Datum:** 2026-04-29
**Bronnen:**
- Movinin → 12 onderzoeksrapporten in `research/movinin/outputs/MIN-001` t/m `MIN-012`
- Sharetribe web-template → afzonderlijke perf-analyse (in conversatie + memory)
- lctnships → baseline-audit + `CLAUDE.md` invariants

---

## TL;DR

1. **Movinin overnemen als fundament zou een downgrade zijn.** Het is functioneel breed (78 features, mobiele app, web + admin), maar ondergemiddeld op productie-grade onderdelen: geen Stripe webhook, geen rate-limiting, geen multi-tenancy isolation op DB-niveau, geen advisory locks, geen caching. Score 2.6/10 op MIN-012.
2. **Sharetribe is de échte benchmark om van te leren** — niet om te kopiëren. Hun **layout-level data fetching + entity caching** patroon is precies wat lctnships mist en is goed te vertalen naar Next.js 16 App Router.
3. **lctnships is op de meeste vlakken al sterker dan Movinin** — Stripe Connect 85/15, webhook idempotency, RLS + column grants, advisory locks, Supabase Auth met MFA. Onze "trage app" zit niet in de stack maar in **fetch-patronen** (use client + useEffect, geen layout-caching, redundant getProfile, etc.).
4. **Concrete conclusie:** Geen rewrite, geen fundament-vervanging. Wel: 7 surgical fixes voor de gevoelde traagheid + adopteren van twee Sharetribe-patterns + cherry-picken van enkele Movinin-ideeën (TTL cleanup, mobile shell, Sentry).

---

## Sectie 1 — Stack-vergelijking (high-level)

| Dimensie | lctnships | Movinin | Sharetribe |
|---|---|---|---|
| Frontend framework | **Next.js 16 App Router** (RSC, SSR) | Vite + React 19 (SPA) | React + custom Express SSR |
| Routing | Next.js file-based + (groups) | React Router 7 | React Router |
| State management | Server Components + Zustand | React Context | **Redux + Thunks + entity normalization** |
| Data fetching | Server queries via Supabase (geen ORM) | Axios in components | Redux thunks met SDK |
| Backend layer | Next.js API routes (colocated) | Express 5 (separaat) | Sharetribe Flex SDK (managed) |
| Database | **PostgreSQL + Supabase** | MongoDB + Mongoose | Sharetribe Flex (managed) |
| Auth | **Supabase Auth (OAuth + MFA)** | Custom JWT + bcrypt + Passport | Sharetribe-managed JWT |
| Authorization | **RLS + column-level grants** | Application-level role checks | Sharetribe-managed |
| Payments | **Stripe Connect 85/15** + webhook + idempotency | Stripe single-tenant + PayPal, **GEEN webhook** | Sharetribe-managed (Stripe Connect under the hood) |
| File storage | Supabase Storage + CDN | Local FS + nginx | Sharetribe-managed |
| Email | Resend + React Email | Nodemailer (raw HTML) | Sharetribe-managed |
| Push notifications | ❌ | Expo Server SDK | ❌ |
| i18n | **next-intl, 5 locales** | i18next, EN+FR | i18next |
| Mobile | ❌ | **Expo + RN 0.83 + EAS** | ❌ |
| Caching | Geen layer | **Disabled (`nocache()`)** | **Redux entity store + SDK cache** |
| Rate limiting | **Upstash Redis + middleware** | ❌ | Sharetribe-managed |
| Observability | Geen visible | **Sentry + Winston** | Sharetribe-managed |
| Concurrency / locks | **Postgres advisory locks** (per CLAUDE.md) | ❌ | Sharetribe-managed |
| Monorepo tooling | n.v.t. (single app) | Geen (TS path aliases) | n.v.t. |
| CI/CD | Vercel + Playwright | GitHub Actions (7 workflows) | n.v.t. |

**Lezing:** lctnships is op zes kritieke vlakken duidelijk sterker dan Movinin: auth (MFA), authorisatie (RLS), payments (Connect+webhook+idempotency), rate-limiting, locks, en webhook-idempotentie. Movinin scoort beter op: observability (Sentry), mobile, push notifications.

---

## Sectie 2 — Feature-matrix

| Feature-domein | lctnships | Movinin | Sharetribe |
|---|---|---|---|
| Listings (CRUD + images + availability) | ✅ studios + studio_images + studio_availability + blocked_dates + equipment | ✅ Property + 7 image fields | ✅ Listings (managed) |
| Search & filter | ✅ explore page (geen geo) | ✅ aggregation pipeline (geen geo) | ✅ ElasticSearch-backed (managed) |
| Booking lifecycle | ✅ create / view / **reschedule** / **extend** / cancel | ✅ create / view / cancel-request (geen refund) | ✅ via transaction process |
| Booking extensions | ✅ `booking_extensions` + `extension_items` | ❌ | ❌ |
| Equipment / extras | ✅ `equipment` + `booking_equipment` | ❌ | ❌ |
| Reviews | ✅ `reviews` table | ❌ | ✅ |
| Chat / conversations | ✅ `conversations` + `messages` | ❌ (alleen notifications) | ✅ via transaction messaging |
| Credits / wallet | ✅ `credits` + `user_credits` + `credit_transactions` | ❌ | ❌ |
| Stripe Connect (host payouts) | ✅ 85/15 + transfer_data + Connect onboarding | ❌ (single-tenant Stripe, off-platform payouts) | ✅ (managed) |
| Refunds | ✅ atomic + `refund_application_fee: true` | ❌ (alleen `cancelRequest` flag) | ✅ |
| Webhook idempotency | ✅ `processed_webhook_events` | ❌ | ✅ |
| Disputes / payout-failed | ✅ `requires_manual_payout_reversal` flag | ❌ | ✅ |
| iCal import/export | ✅ Wix + MeetingPackage import + bookings export | ❌ | ❌ |
| 2FA | ✅ TOTP via Supabase MFA (gated achter `MFA_ENFORCEMENT` flag) | ❌ | ❌ |
| Push notifications | ❌ | ✅ Expo + token registration | ❌ |
| Mobile app | ❌ | ✅ Expo Router, 16 screens (renter-only) | ❌ |
| Multi-language | ✅ NL/EN/ES/FR/DE | ✅ EN/FR | ✅ |
| Cron jobs | ✅ Vercel cron (extension-reminders) | ❌ | n.v.t. |
| TTL auto-cleanup | ❌ (handmatig of cron) | ✅ `expireAt` op User/Booking/Token | n.v.t. |
| Open-redirect protection | ✅ `validateRedirectPath()` | ❌ | n.v.t. |
| SSRF protection | ✅ HTTPS+allowlist+private-IP-block | ❌ | n.v.t. |

**Lezing:**
- lctnships heeft **veel meer domein-functionaliteit**: extensions, equipment, reviews, chat, credits, Stripe Connect met payouts, iCal, 2FA. Dit is een marketplace met diepte.
- Movinin's enige features die lctnships **niet** heeft zijn: mobile app, push notifications, en Sentry observability.
- Sharetribe kan veel managed dingen aanbieden omdat hun Flex-platform die levert — maar hun web-template is een schil daaromheen, niet vergelijkbaar als zelf-gehost.

---

## Sectie 3 — Performance & Scalability scorecard

Punten op 10. Lctnships-cijfers zijn ingeschat op basis van CLAUDE.md + baseline audit; Movinin uit MIN-012; Sharetribe op basis van publieke documentatie en de perf-analyse.

| Dimensie | lctnships | Movinin | Sharetribe |
|---|---|---|---|
| Caching layer | 3/10 (geen layer; React.cache request-scoped) | 1/10 (`nocache()` actief) | 8/10 (Redux entity normalization + SDK cache) |
| DB query patterns | 5/10 (enkele `select(*)`, geen N+1, missende limits op host pages) | 4/10 (index/filter mismatch op Property search) | 8/10 (managed, indexed) |
| Rate limiting | **8/10** (Upstash Redis + middleware) | 1/10 (geen) | 7/10 (managed) |
| Image handling | 7/10 (Supabase Storage + CDN, `next/image`) | 2/10 (local FS, geen srcset) | 8/10 (managed CDN + variants) |
| Background jobs | 4/10 (Vercel cron alleen) | 1/10 (alles synchroon) | 7/10 (managed transactions) |
| Bundle / code-splitting | 6/10 (Next.js automatisch + RSC) | 5/10 (Vite + lazy routes, geen prefetch hints) | 8/10 (loadable + chunk names + prefetch) |
| Webhook reliability | **9/10** (Stripe webhook + idempotency table) | 1/10 (geen webhook, polling-on-return-URL) | 9/10 (managed) |
| Concurrency / race conditions | **8/10** (Postgres advisory locks) | 2/10 (geen lock op booking create) | 8/10 (managed transactions) |
| Multi-tenancy isolation | **9/10** (RLS + column grants) | 3/10 (app-level, leak risks) | 8/10 (managed) |
| Observability | 3/10 (geen Sentry/APM) | **5/10** (Sentry + Winston) | 7/10 (managed dashboards) |
| **Gemiddeld** | **6.2 / 10** | **2.5 / 10** | **7.6 / 10** |

**Lezing:**
- lctnships scoort gemiddeld dubbel zo hoog als Movinin op productie-grade fundamenten.
- Onze grootste zwaktes: caching layer en observability. Beide zijn relatief klein in te bouwen.
- Sharetribe's voorsprong zit in caching + bundle strategy + managed background jobs.

---

## Sectie 4 — De gevoelde traagheid: root cause

De gebruiker meldt: "de app is gewoon traag, vooral renter ↔ host dashboard navigatie". De baseline-audit (`a7f4ed1392fccfafd` agent) heeft acht concrete bottlenecks blootgelegd. **Geen daarvan is een stack-keuze; allemaal zijn het fetch-patronen.**

| # | Bottleneck | Impact | Fix-effort | Bron |
|---|---|---|---|---|
| 1 | `notifications/page.tsx` is volledig `"use client"` met useEffect-fetch — blanco scherm tot hydration klaar | 🔴 Hoog | Klein (server component + Suspense) | baseline #2 |
| 2 | Middleware roept sequentieel `auth.getUser()` + MFA check op elke navigatie | 🔴 Hoog | Medium (MFA in cookie cachen) | baseline #1 |
| 3 | `getProfile()` doet `select("*")` ipv alleen benodigde columns | 🟡 Medium | Triviaal | baseline #7 |
| 4 | Host bookings page fetcht ALLE bookings + filtert in JS | 🟡 Medium | Klein (`limit()` + `.eq("status")`) | baseline #3 |
| 5 | Host dashboard fetcht ALLE reviews om gemiddelde te berekenen | 🟡 Medium | Klein (RPC met AVG()) | baseline #5 |
| 6 | Geen layout-level data caching tussen renter ↔ host | 🟠 Architectuur | Groot (Sharetribe-pattern) | baseline #8 + Sharetribe |
| 7 | Notifications poll elke 30s ipv Supabase Realtime | 🟢 Laag | Klein | baseline #6 |
| 8 | Sidebar/Navbar `"use client"` re-renders compleet bij dashboard switch | 🟡 Medium | Klein (server-side `isHost` check + prop) | baseline #4 + #8 |

---

## Sectie 5 — Wat we van Sharetribe leren

Sharetribe is **operationeel** een goede benchmark voor patterns die we naar Next.js 16 kunnen vertalen.

### Pattern A — Layout-level data fetching met `React.cache()`
**Probleem nu:** Renter dashboard en host dashboard zijn twee verschillende route groups. Wisselen tussen beide herstart de hele layout, herfetcht user/profile, herfetcht alles.

**Sharetribe pattern:** Routes definiëren een `loadData()` die op de server draait en alle dashboard-data parallel ophaalt. Daarna leeft de data in een Redux entity store die persistent is over routes heen.

**Onze adoptie:**
```typescript
// src/app/[locale]/(dashboard)/layout.tsx (en (host)/layout.tsx)
import { cache } from 'react';

const getDashboardData = cache(async (userId: string) => {
  const [profile, bookings, notifications] = await Promise.all([
    getProfileLite(userId),
    getRecentBookings(userId),
    getUnreadNotifications(userId),
  ]);
  return { profile, bookings, notifications };
});

export default async function DashboardLayout({ children }) {
  const data = await getDashboardData(userId);
  return <DashboardProvider initialData={data}>{children}</DashboardProvider>;
}
```
**Effect:** De data wordt 1x per request gefetcht, niet per page. Wisselen renter↔host: `cache()` herkent dezelfde key en serveert cached data.

### Pattern B — Page-level Suspense met skeletons (al deels aanwezig)
Sharetribe rendert skeletons binnen 50ms en streamt data erin. Wij hebben `loading.tsx` op (dashboard) en (host), maar de eerste heavy-fetch zit nog steeds buiten Suspense. Verplaatsen van zware queries naar `<Suspense>` boundaries lost dit op.

### Pattern C — `next/dynamic` met prefetch on hover
Sharetribe gebruikt `webpackPrefetch: true` om route-chunks te downloaden terwijl de user op een andere page is. In Next.js: `next/link` doet dit standaard maar niet voor `dynamic()` imports. Voor de "Switch to Host" knop in de Sidebar kunnen we op hover de host-bundle prefetchen.

---

## Sectie 6 — Wat we van Movinin meenemen (cherry-pick, niet adopteren)

Drie ideeën die het overwegen waard zijn, allemaal optioneel:

### Idee 1 — TTL-based cleanup voor abandoned checkouts
Movinin's `Booking.expireAt` index laat MongoDB automatisch abandoned-checkout bookings deleten na N seconden. lctnships heeft dit niet — onze `bookings.status = 'pending'` rijen blijven staan tot iemand handmatig opruimt.

**Voor Postgres:** een `pg_cron` of Vercel-cron job die elke 15 minuten `DELETE FROM bookings WHERE status='pending' AND created_at < NOW() - INTERVAL '24 hours'` draait. Geen TTL native, maar functioneel equivalent.

### Idee 2 — Sentry integration
Movinin's `@sentry/node` + `Sentry.setupExpressErrorHandler` is een 30-minuten setup die ons een echte error monitoring geeft. lctnships heeft niets visible — dit is een productie-grade gap.

**Voor Next.js:** `@sentry/nextjs` met source maps upload tijdens build. Gemakkelijk in te bouwen.

### Idee 3 — Mobile shell als toekomstige optie
Als we ooit een mobile app bouwen: Movinin's Expo Router + RN Paper + EAS-pipeline + shared types via path aliases is een credible startpunt. Niet kopiëren, maar referenceren.

**Wat we zeker NIET overnemen van Movinin:**
- Het auth model (JWT in plain AsyncStorage op mobile is een security gap)
- Het ontbreken van Stripe webhook (kritisch in productie)
- De application-level multi-tenancy (RLS is fundamenteel sterker)
- De manual monorepo via TS path aliases (gebruik pnpm workspaces of Turborepo)

---

## Sectie 7 — Roadmap

### Week 1 — Quick wins voor "app is traag" (geen architectuur, geen risico)

| Task | Bottleneck | Effort | Verwachte impact |
|---|---|---|---|
| 1.1 | Convert `notifications/page.tsx` naar server component met `<Suspense>` | #1 | -300ms TTI, geen blank screen |
| 1.2 | Shrink `getProfile()` query naar alleen benodigde kolommen | #3 | -50ms per page nav |
| 1.3 | Add `.limit(50)` + `.eq("status",...)` aan host bookings page | #4 | -200ms voor hosts met >50 bookings |
| 1.4 | Replace host dashboard reviews-fetch met RPC `get_host_rating_stats` | #5 | -200ms voor hosts met >100 reviews |
| 1.5 | Replace 30s polling op notifications met Supabase Realtime | #7 | Geen loops, beter UX |
| 1.6 | Sidebar `isHost` check in layout (server) → prop ipv `useUser()` | #8 | Minder client-side logica |

Geen breaking changes. Allemaal binnen 1 dag te doen.

### Week 2 — Sharetribe pattern: layout-level data caching

| Task | Bottleneck | Effort |
|---|---|---|
| 2.1 | Implementeer `getDashboardData()` met `React.cache()` in (dashboard) layout | #6 |
| 2.2 | Idem voor (host) layout |  |
| 2.3 | Migreer 2-3 dashboard pages om data uit context te lezen ipv eigen fetch |  |

### Week 3 — Operational excellence (niet snelheid, wel volwassenheid)

| Task | Effort |
|---|---|
| 3.1 | Sentry integration via `@sentry/nextjs` |
| 3.2 | MFA assurance level cachen in httpOnly cookie (5 min TTL) — bottleneck #2 |
| 3.3 | `pg_cron` job voor abandoned-checkout cleanup (TTL pattern uit Movinin) |

### Later (optioneel, niet voor MVP)

- Mobile app via Expo Router (referentie: Movinin)
- Bundle analysis met `@next/bundle-analyzer` om te kijken of dashboard chunks te zwaar zijn
- Code Connect mappings als we Figma gebruiken

---

## Sectie 8 — Antwoord op de oorspronkelijke vraag

> "Hoe kunnen we de app verbeteren op basis van bestaande projecten waarvan we weten dat ze al werken?"

**Het eerlijke antwoord, na 12 tickets onderzoek:**

1. **Movinin "kopiëren" zou de app slechter maken**, niet beter. Hun stack is op kritieke productie-onderdelen ondergemiddeld.
2. **Sharetribe is wel een goede leerbron** — niet om over te nemen, maar om hun layout-caching pattern te adopteren in onze Next.js code.
3. **De gevoelde traagheid is geen stack-probleem** maar een fetch-pattern probleem in 6 specifieke pages. Allemaal te fixen in een week.
4. **Onze eigen stack (Next.js 16 + Supabase + Stripe Connect + RLS) is op de meeste vlakken al sterker** dan beide referenties. Wat we missen — caching layer, Sentry, mogelijk mobile — kunnen we incrementeel toevoegen zonder rewrite.

**Beslissingen die we nu kunnen nemen:**

- ✅ **Accepteren:** lctnships als eigen fundament behouden. Geen migration naar Movinin of Sharetribe codebase.
- ✅ **Doen (Week 1):** 6 surgical perf fixes (sectie 7).
- ✅ **Doen (Week 2):** Sharetribe-pattern voor layout-level data caching.
- ✅ **Doen (Week 3):** Sentry + MFA cookie cache + abandoned-checkout cleanup.
- 🤔 **Overwegen later:** Mobile app via Expo Router (alleen als business-prioriteit).
- ❌ **Niet doen:** Geen rewrite, geen vendor-lock op Sharetribe Flex, geen MongoDB migratie.

---

## Appendix — Bronbestanden

Alle 12 onderzoeksrapporten:
- [MIN-001 Repository Structure](movinin/outputs/MIN-001-structure.md)
- [MIN-002 Tech Stack](movinin/outputs/MIN-002-stack.md)
- [MIN-003 Database Schema](movinin/outputs/MIN-003-database.md)
- [MIN-004 Booking Flow](movinin/outputs/MIN-004-booking-flow.md)
- [MIN-005 Multi-host Architecture](movinin/outputs/MIN-005-multi-host.md)
- [MIN-006 Stripe Integration](movinin/outputs/MIN-006-stripe.md)
- [MIN-007 Availability & Calendar](movinin/outputs/MIN-007-availability.md)
- [MIN-008 Mobile App](movinin/outputs/MIN-008-mobile.md)
- [MIN-009 Search & Filter](movinin/outputs/MIN-009-search.md)
- [MIN-010 Feature Inventory](movinin/outputs/MIN-010-features.md)
- [MIN-011 Architecture Diagrams](movinin/outputs/MIN-011-diagrams.md)
- [MIN-012 Performance Assessment](movinin/outputs/MIN-012-performance.md)

Sharetribe analyse: in conversatie / agent-output transcript (`a28ffa807bcda0640.output`).
Lctnships baseline: in conversatie / agent-output transcript (`a7f4ed1392fccfafd.output`).
