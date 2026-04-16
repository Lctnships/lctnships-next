# Ticket Overview — Evolutie naar Multi-App

**Project:** lctnships
**Strategie:** strangler-fig (zie [MIGRATION-PLAN.md](./MIGRATION-PLAN.md))
**Prefix:** `LCN-` (1xx voor evolutie-werk; 0xx gereserveerd voor nood-fixes pre-launch)
**Laatst bijgewerkt:** 2026-04-15

---

## Dashboard

```
Overall Progress: ░░░░░░░░░░  0%   (0/29 done)

Fase 1 — Monorepo:        ░░░░░░░░░░  0%   (0/7)
Fase 2 — Split apps:      ░░░░░░░░░░  0%   (0/12)
Fase 3 — Cutover:         ░░░░░░░░░░  0%   (0/5)
Fase 4 — Hardening:       ░░░░░░░░░░  0%   (0/5)
```

---

## Status Legenda

| Emoji | Status | | Emoji | Prioriteit |
|---|---|---|---|---|
| ⚪ | Todo | | 🔴 | Kritiek (blokkeert launch) |
| 🟡 | In progress | | 🟠 | Hoog (launch-relevant) |
| 🟢 | Done | | 🟡 | Medium (post-launch OK) |
| 🔵 | Blocked | | 🟢 | Laag |
| ⚫ | Cancelled | | | |

---

## Fase 1 — Monorepo-ify (week 17)

| ID | Titel | Type | Component | Effort | Prio | Status |
|---|---|---|---|---|---|---|
| LCN-100 | Turborepo bootstrap + workspace config | 🔧 Setup | Infra | 2u | 🔴 | ⚪ Todo |
| LCN-101 | Verplaats huidige `src/` naar `apps/web/` | 🔧 Setup | Infra | 2u | 🔴 | ⚪ Todo |
| LCN-102 | `packages/shared` extracten (lib helpers, types) | 🔧 Setup | Packages | 2u | 🔴 | ⚪ Todo |
| LCN-103 | `packages/supabase` extracten (clients + types) | 🔧 Setup | Packages | 2u | 🔴 | ⚪ Todo |
| LCN-104 | `packages/stripe` extracten | 🔧 Setup | Packages | 1u | 🟠 | ⚪ Todo |
| LCN-105 | `packages/ui` extracten (shadcn) | 🔧 Setup | Packages | 2u | 🟠 | ⚪ Todo |
| LCN-106 | CI: turbo build + test + tsc + lint pipeline | 🔧 Setup | Infra | 2u | 🔴 | ⚪ Todo |

<details>
<summary>LCN-100 — Turborepo bootstrap</summary>

**Files:** `package.json` (workspaces), `turbo.json`, `pnpm-workspace.yaml` of `package.json#workspaces`
**Acceptance:**
- [ ] `turbo dev`, `turbo build`, `turbo test`, `turbo lint` werken
- [ ] Vercel "root directory" instelling blijft repo-root
- [ ] `apps/web/package.json` heeft scripts: dev/build/test/lint
- [ ] Geen submodules geknakt
- [ ] `.gitignore` bijgewerkt voor `apps/*/.next`, `apps/*/.turbo`, `packages/*/dist`

</details>

<details>
<summary>LCN-101 — Verplaats src/ naar apps/web/</summary>

**Risico:** import-paden breken massaal (`@/lib/foo` → `@/lib/foo` blijft, MAAR alleen als `tsconfig.json#paths` correct staat per app).
**Acceptance:**
- [ ] Alle imports werken zonder wijziging in code
- [ ] `apps/web/tsconfig.json` extends repo-root config en zet eigen `baseUrl`
- [ ] `apps/web/next.config.ts` wijst correct
- [ ] `npm run dev -- --port 3002` (Playwright vereiste) werkt
- [ ] 33 E2E groen tegen `apps/web` op :3002

</details>

<details>
<summary>LCN-102 — packages/shared extracten</summary>

**Inhoud:**
- `src/lib/format-locale.ts`
- `src/lib/booking-duration.ts`
- `src/lib/redirect.ts`
- `src/lib/seo.ts`
- `src/lib/logger.ts`

**Acceptance:**
- [ ] Package gepubliceerd als `@lctnships/shared` (workspace, niet npm)
- [ ] `apps/web` importeert via `@lctnships/shared`
- [ ] Tests verplaatsen mee als ze bestaan
- [ ] Geen circular deps

</details>

<details>
<summary>LCN-103 — packages/supabase extracten</summary>

**Inhoud:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`
- `src/types/database.types.ts`

**Acceptance:**
- [ ] Exports: `createClient`, `createServerClient`, `createServiceClient`, `createAdminClient`, `updateSession`
- [ ] Cookie-options exposed zodat apps het `domain` parent-cookie kunnen forceren (zie LCN-113)
- [ ] Hook `auto-types` blijft werken (`supabase gen types`)

</details>

<details>
<summary>LCN-106 — CI pipeline</summary>

**Files:** `.github/workflows/ci.yml`
**Acceptance:**
- [ ] PR-trigger: tsc + lint + test parallel via turbo cache
- [ ] Failing test = blocked merge
- [ ] Build cache opgeslagen (Turborepo Remote Cache of GH Actions cache)
- [ ] < 5 min duration

</details>

---

## Fase 2 — Split apps (week 18-19)

| ID | Titel | Type | Component | Effort | Prio | Status |
|---|---|---|---|---|---|---|
| LCN-110 | `apps/host` scaffold + Vercel project | 🔧 Setup | Infra | 2u | 🔴 | ⚪ Todo |
| LCN-111 | Host routes kopiëren naar `apps/host` | ✏️ Refactor | Frontend | 4u | 🔴 | ⚪ Todo |
| LCN-112 | Host auth middleware + role guard | 🔒 Security | Auth | 2u | 🔴 | ⚪ Todo |
| LCN-113 | Cross-domain cookie config (`.lctnships.com`) | 🔒 Security | Auth | 2u | 🔴 | ⚪ Todo |
| LCN-114 | Supabase Auth + Google OAuth + Stripe redirect URIs bijwerken | 🔧 Setup | Infra | 1u | 🔴 | ⚪ Todo |
| LCN-115 | E2E tests draaien tegen `host.lctnships.com` | ✅ Test | Test | 2u | 🟠 | ⚪ Todo |
| LCN-120 | `apps/renter` scaffold + Vercel project | 🔧 Setup | Infra | 2u | 🔴 | ⚪ Todo |
| LCN-121 | Renter routes kopiëren naar `apps/renter` | ✏️ Refactor | Frontend | 4u | 🔴 | ⚪ Todo |
| LCN-122 | Booking-flow regression op renter sub | ✅ Test | Test | 2u | 🔴 | ⚪ Todo |
| LCN-123 | Stripe Checkout + webhook canonical-URL test | 🔒 Security | Backend | 2u | 🔴 | ⚪ Todo |
| LCN-124 | Renter E2E tegen `app.lctnships.com` | ✅ Test | Test | 2u | 🟠 | ⚪ Todo |
| LCN-125 | 48u parallel-monitoring window | 📊 Observ | Infra | 0u | 🟠 | ⚪ Todo |

<details>
<summary>LCN-110 — apps/host scaffold</summary>

**Files:** `apps/host/package.json`, `apps/host/next.config.ts`, `apps/host/app/layout.tsx`
**Acceptance:**
- [ ] Next.js 16 (zelfde versie als web)
- [ ] Importeert `@lctnships/supabase`, `@lctnships/ui`, `@lctnships/shared`, `@lctnships/stripe`
- [ ] Vercel project `lctnships-host` aangemaakt
- [ ] Custom domain `host.lctnships.com` geconfigureerd
- [ ] Zelfde env vars (preview + production)
- [ ] Build slaagt, deployt naar `host-lctnships.vercel.app`

</details>

<details>
<summary>LCN-111 — Host routes verplaatsen</summary>

**Verplaats van `apps/web/src/app/[locale]/(host)/host/**`** naar `apps/host/app/[locale]/**`.
**Behoud:** dezelfde route paths zodat URL's identiek blijven (alleen domain wisselt).
**Acceptance:**
- [ ] `/host/dashboard`, `/host/calendar`, `/host/bookings`, `/host/services`, `/host/studios`, `/host/earnings`, `/host/settings` werken op host.lctnships.com
- [ ] Onboarding-flow werkt
- [ ] i18n routing intact (5 locales)
- [ ] Tests passen `tests/host-calendar.spec.ts` aan voor sub-URL via `baseURL` Playwright project

</details>

<details>
<summary>LCN-113 — Cross-domain cookie</summary>

**Risico:** zonder dit moet user 3× inloggen.
**Files:** `packages/supabase/src/server.ts`, `packages/supabase/src/client.ts`
**Acceptance:**
- [ ] Cookie domain = `.lctnships.com` in production, `undefined` in dev
- [ ] Inloggen op `host.lctnships.com` → ingelogd op `app.lctnships.com`
- [ ] Logout op één → logout op alle
- [ ] `sameSite=lax`, `secure=true` in production
- [ ] Test: Playwright login op host, navigate naar app, geen redirect naar /login

</details>

<details>
<summary>LCN-114 — Auth + OAuth + Stripe redirects</summary>

**Acceptance:**
- [ ] Supabase Auth dashboard: `site_url` = `https://lctnships.com`, additional `redirect_urls` = `https://host.lctnships.com/auth/callback`, `https://app.lctnships.com/auth/callback`, `https://lctnships.com/auth/callback`
- [ ] Google OAuth Console: 3 redirect URIs toegevoegd
- [ ] Stripe Connect: nieuwe redirect URI's voor onboarding
- [ ] Stripe webhook URL **NIET** veranderd — blijft `https://www.lctnships.com/api/stripe/webhook`
- [ ] Test: nieuwe user signup via host sub redirect correct terug

</details>

<details>
<summary>LCN-122 — Booking-flow regression</summary>

**Acceptance:**
- [ ] On-request flow end-to-end via `app.lctnships.com` (5 stappen)
- [ ] Instant-book flow end-to-end (4 stappen + Stripe redirect)
- [ ] Pay-link flow vanuit approved booking
- [ ] Webhook-callback eindigt op `lctnships.com/api/stripe/webhook` (canonical) en update booking via service-client
- [ ] `tests/booking-flows.spec.ts` slaagt tegen renter sub

</details>

---

## Fase 3 — Cutover (week 20)

| ID | Titel | Type | Component | Effort | Prio | Status |
|---|---|---|---|---|---|---|
| LCN-130 | Feature-flag 301 redirects (10% canary) | 🚦 Migration | Infra | 2u | 🔴 | ⚪ Todo |
| LCN-131 | Redirects 100% + 24u monitoring | 🚦 Migration | Infra | 0u | 🔴 | ⚪ Todo |
| LCN-132 | `apps/web` afslanken — host + renter routes verwijderen | 🧹 Cleanup | Frontend | 3u | 🟠 | ⚪ Todo |
| LCN-133 | Regression E2E op alle drie subs | ✅ Test | Test | 2u | 🔴 | ⚪ Todo |
| LCN-134 | CLAUDE.md + ADR's bijwerken voor nieuwe staat | 📚 Docs | Docs | 2u | 🟠 | ⚪ Todo |

<details>
<summary>LCN-130 — Canary redirects</summary>

**Files:** `apps/web/middleware.ts`
**Acceptance:**
- [ ] `REDIRECT_HOST=true` voor 10% van requests (cookie-based bucket)
- [ ] 301 → `host.lctnships.com${pathname}`
- [ ] Niet voor RSC prefetches (Next-Url header check)
- [ ] Sentry monitoring: 4xx-rate < baseline+10%
- [ ] Rollback procedure: env var op false, redeploy

</details>

<details>
<summary>LCN-132 — apps/web afslanken</summary>

**Verwijder:**
- `apps/web/app/[locale]/(host)/`
- `apps/web/app/[locale]/(dashboard)/`
- `apps/web/app/[locale]/(booking)/`
- `apps/web/app/api/bookings/`, `bookings/[id]/`
- Alleen behouden: `(public)/(home|become-host|help|blog|legal)`, `auth/*`, `api/stripe/webhook`, `api/cron/*`

**Acceptance:**
- [ ] Bundle-size halveert
- [ ] Geen dode imports
- [ ] `/api/stripe/webhook` blijft canonical
- [ ] `/api/cron/*` blijven canonical

</details>

---

## Fase 4 — Hardening + buffer (week 21-22)

| ID | Titel | Type | Component | Effort | Prio | Status |
|---|---|---|---|---|---|---|
| LCN-140 | OWASP audit + RLS deep-check + Stripe review | 🔒 Security | All | 4u | 🔴 | ⚪ Todo |
| LCN-141 | Lighthouse + Core Web Vitals (target ≥85 mobiel) | ⚡ Perf | Frontend | 3u | 🟠 | ⚪ Todo |
| LCN-142 | Error boundaries + 404/500 + toast UX | ✏️ Refactor | Frontend | 2u | 🟡 | ⚪ Todo |
| LCN-143 | Accessibility — keyboard nav, ARIA, contrast | ♿ A11y | Frontend | 3u | 🟡 | ⚪ Todo |
| LCN-144 | Seed-data + staging smoke tests | ✅ Test | Test | 2u | 🟠 | ⚪ Todo |
| LCN-145 | Runbook — rollback, on-call, status page | 📚 Docs | Ops | 2u | 🟠 | ⚪ Todo |

<details>
<summary>LCN-140 — Security audit</summary>

**Scope:**
- OWASP Top 10 review (gebruik `/security-review` skill)
- RLS-state probe via `rls_state()` rpc (zie migratie 028)
- Stripe webhook idempotency: status='processing' / staleness werkt
- Column-level grants users/bookings ongewijzigd
- Cross-domain cookie scope: kan een sub-app cookies van een ander zien?

**Acceptance:**
- [ ] Geen HIGH severity findings
- [ ] MEDIUM findings ≤ 2, met ticket gepland post-launch
- [ ] Audit-rapport in `docs/SECURITY-REPORT.md` bijgewerkt

</details>

---

## Backlog (post-launch, niet pre-launch)

| ID | Titel | Reden uitgesteld |
|---|---|---|
| LCN-200 | PostGIS + `search_studios_nearby()` RPC | Niet kritiek bij <500 studios |
| LCN-201 | Advisory locks voor double-booking | Huidige RLS dekt 99% — race is theoretisch zeldzaam |
| LCN-202 | Push notificaties (web + iOS) | Email-notifs werken, push is luxe |
| LCN-203 | Native mobile app (Expo) | Web is responsive, mobile = v2 |
| LCN-204 | Multi-provider payments (Mollie/PayPal) | Stripe dekt NL/EU markt |
| LCN-205 | Microservices voor search/recommendations | Premature optimalisatie bij huidige schaal |

---

## Hoe een ticket gepakt wordt

```bash
# 1. Pull main
git checkout main && git pull --rebase

# 2. Branch naar LCN-XXX
git checkout -b feat/LCN-XXX-korte-beschrijving

# 3. Werk + tests + commits
# ... (run tests locally voordat je pusht)

# 4. PR open, beschrijving = ticket-acceptance criteria
gh pr create --base main --title "LCN-XXX: ..."

# 5. Na merge: status update in dit document
```
