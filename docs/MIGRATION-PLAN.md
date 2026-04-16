# Migration Plan — Monoliet → Turborepo Multi-App

**Strategie:** strangler-fig (evolutie, geen rebuild)
**Motivatie:** live op `lctnships.com`, launch eind mei 2026, 33 E2E tests groen, 28 migraties stabiel. Rebuild-van-0 → onnodig risico. In-place evolutie → zelfde DB, zelfde webhooks, nul downtime.

---

## Waarom niet rebuilden

| Aspect | Rebuild from scratch | Evolutie (dit plan) |
|---|---|---|
| Downtime-risico | Data-cutover = minstens 1u freeze | Nul — dezelfde DB blijft |
| Stripe-continuïteit | Webhook-URL wisselen, in-flight payments breken | Zelfde endpoint, zelfde customers |
| Bestaande users | Opnieuw inloggen | Geen merkbaar verschil |
| Werkdagen tot launch | 25 (Airbnb-plan) | ~13 (3 weken) |
| Buffer voor bugs | Geen | 2–3 weken |
| Weggooi-code | Alles | Alleen `apps/web/(host)/*` bij cutover |
| Tests herschrijven | Ja (paden wijzigen) | Nee (1:1 in monorepo) |
| Migratie-history | Verloren | 28 migraties intact |

De `REPORT.md` staat nu op ~6/10 (niet 0/10). We moeten geen fundamenten gieten die er al zijn.

---

## 3-Fase Plan

### Fase 1 — Monorepo-ify in-place (week 1, ~3 dagen)

Converteer de huidige repo naar Turborepo zonder één route te verplaatsen.

```
lctnships-next/                          ← zelfde git repo, zelfde URL
├── apps/
│   └── web/                             ← huidige src/ hierheen, 1:1
│       └── ... (alle routes blijven staan)
├── packages/
│   ├── shared/                          ← src/lib/format-locale, booking-duration, redirect, seo
│   ├── supabase/                        ← src/lib/supabase/* + types/database.types.ts
│   ├── stripe/                          ← src/lib/stripe/*
│   └── ui/                              ← src/components/ui/* (shadcn)
├── supabase/                            ← ongewijzigd — 28 migraties blijven
├── tests/                               ← ongewijzigd — 33 E2E groen
├── turbo.json                           ← nieuw
└── package.json                         ← workspaces config
```

**Gate Fase 1:**
- `turbo dev` start `apps/web` op :3002
- `turbo build` slaagt
- `turbo test` → 33/33 groen
- `npx tsc --noEmit` schoon
- Vercel deploy identiek aan nu
- Zero user-facing verschil

### Fase 2 — Split naar subdomeinen, oude URL's blijven (week 2–3, ~7 dagen)

Maak `apps/host` + `apps/renter` in dezelfde monorepo. **Kopieer** routes naar deze apps (niet verwijderen uit `apps/web`).

```
apps/
├── web/      → lctnships.com              (blijft ALLES doen — oude flow fallback)
├── host/     → host.lctnships.com         (nieuw — alleen /host/* routes + auth + layout)
└── renter/   → app.lctnships.com          (nieuw — renter-facing routes)
```

**Per app, wat verhuist:**

- `apps/host` — `src/app/[locale]/(host)/host/**`, host-onboarding, host-API routes die specifiek zijn
- `apps/renter` — `src/app/[locale]/(dashboard)/**`, `(booking)/**`, `(public)/studios/**`, `(public)/explore/**`
- `apps/web` — `(public)/(home|become-host|help|blog|legal)/*`, blijft generiek
- **Gedeelde API routes** (`/api/stripe/webhook`, `/api/bookings/*`, `/api/conversations`, `/api/messages`, `/api/services`) — blijven in `apps/web` voor één canonical webhook-endpoint. Of: verhuis naar `apps/api` Next-project als je API-scheiding wil (aanrader voor v2, niet nu).

**Cross-domain vereisten (vóór cutover):**
- Supabase Auth `site_url` + `redirect_urls`: voeg toe `https://host.lctnships.com/auth/callback`, `https://app.lctnships.com/auth/callback`
- Cookie-scope: `.lctnships.com` parent-domain (zodat SSO werkt tussen subs). In Supabase: configureer cookie-options of laat `@supabase/ssr` dit regelen via `cookieOptions.domain`
- Google OAuth console: nieuwe redirect URIs toevoegen
- Stripe Connect: redirect URIs in dashboard bijwerken
- Stripe webhook: **niet** wisselen — blijft `https://www.lctnships.com/api/stripe/webhook`

**Feature-flag redirects (off by default):**

```ts
// apps/web/middleware.ts
if (pathname.startsWith('/host') && process.env.REDIRECT_HOST === 'true') {
  return NextResponse.redirect(`https://host.lctnships.com${pathname}`, 301)
}
```

**Gate Fase 2:**
- Host kan inloggen op **beide** `lctnships.com/host` én `host.lctnships.com`
- Renter op beide `lctnships.com/bookings` én `app.lctnships.com/bookings`
- SSO werkt tussen subs (inloggen op één → ingelogd op alle)
- E2E tests draaien tegen beide URL-sets

### Fase 3 — Cutover + cleanup (week 4, ~3 dagen)

1. Feature flag `REDIRECT_HOST=true`, `REDIRECT_RENTER=true` → 301's van `lctnships.com/host/*` naar `host.lctnships.com`
2. 48u monitoring via Sentry + Vercel analytics
3. `apps/web` afslanken tot marketing-only — verwijder `(host)` + `(dashboard)` + `(booking)` groups
4. Laatste E2E run → 33+/33+ groen
5. CLAUDE.md bijwerken

**Gate Fase 3 = Launch-ready:**
- Alle host-flows via `host.lctnships.com`
- Alle renter-flows via `app.lctnships.com`
- Marketing op `lctnships.com`
- Zero 404's, zero 5xx-spikes, zero orphaned bookings
- Security-audit passed (RLS + Stripe + CSP headers)

---

## Data-migratie: nul

Zelfde Supabase project (`ytmkmiofoluespwysfxa`), zelfde DB, zelfde tabellen, zelfde 28 migraties. Geen dump, geen restore, geen FK-mapping, geen Stripe customer re-link. Dit is het grootste argument tegen de rebuild.

## Region-keuze

Huidige DB zit op `eu-west-1` (Dublin). Het originele plan noemde `eu-central-1` (Frankfurt). Voor NL-users is het latency-verschil ~20ms. Niet de moeite waard voor launch. Blijven op eu-west.

## Cross-app sessie (belangrijk detail)

Supabase `@supabase/ssr` zet cookies op `lctnships.com` als je `cookieOptions.domain = '.lctnships.com'` forceert. Anders krijg je drie aparte sessies (host, renter, web). Test dit in Fase 2.

Concreet in `packages/supabase/src/server.ts`:
```ts
const supabase = createServerClient(url, key, {
  cookies: { /* ... */ },
  cookieOptions: {
    domain: process.env.NODE_ENV === 'production' ? '.lctnships.com' : undefined,
    sameSite: 'lax',
    secure: true,
  },
})
```

## Fallback: plan B

Als evolutie alsnog spaak loopt: **launch eind mei op de huidige codebase zoals-ie is, rebuild ná launch rustig in 2–3 maanden**. Never: launch + rebuild tegelijk. Daar sterven projecten.

## Wat dit plan NIET doet (bewust buiten scope)

- PostGIS geo-search met RPC — kan ná launch toegevoegd in migratie 029+
- Advisory locks voor double booking — kan direct in huidige repo (migratie 029), geen rebuild nodig
- Mobile native app — alsnog later
- Multi-provider payments (Braintree/PayPal) — Stripe Connect dekt NL/EU

## Volgende stap

Kijk naar [TICKETS.md](./TICKETS.md) — de 3 fases zijn opgedeeld in ~18 concrete LCN-tickets. Ga verder met **LCN-100** (Turborepo bootstrap).
