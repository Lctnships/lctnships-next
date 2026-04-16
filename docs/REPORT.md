# Code Quality & Architecture Report

**Project:** lctnships
**Datum:** 2026-04-15
**Status:** Live op `https://www.lctnships.com`
**Auditor:** Claude Opus 4.6

---

## Overall Score: **6.8/10** (huidig)

```
Huidige scores (na 28 migraties + 33 E2E + security audit 2026-04-11):

Security (OWASP):     ████████░░  7/10  (RLS + Stripe-idempotent + column grants; CSP nog te doen)
Code Quality:         ███████░░░  7/10  (tsc strict=false, ESLint passt, geen dode code)
Architecture:         ██████░░░░  6/10  (Monoliet, single Next-app — target = multi-app)
Performance:          ███████░░░  7/10  (Turbopack, code splitting, RSC; geen Lighthouse meting)
Documentation:        ████████░░  8/10  (CLAUDE.md, SECURITY-REPORT, dit docs/, inline comments)
Test Coverage:        ███████░░░  7/10  (33 E2E groen — booking + services + messages + projects)
─────────────────────────────────────────
Overall:              ███████░░░  6.8/10
```

## Target Score na launch eind mei: **9.0/10**

```
Verwacht na evolutie + hardening (Fase 1-4 uit ROADMAP.md):

Security (OWASP):     █████████░  9/10  (+CSP +RLS audit volledig + dependency scan)
Code Quality:         █████████░  9/10  (+monorepo type-safety + shared packages)
Architecture:         █████████░  9/10  (Multi-app, correcte separation)
Performance:          ████████░░  8/10  (Per-app bundle, edge runtime API, Lighthouse ≥85)
Documentation:        █████████░  9/10  (Runbook + ADR's + on-call)
Test Coverage:        ████████░░  8/10  (Critical paths + cross-domain E2E + Stripe sandbox tests)
─────────────────────────────────────────
Target:               █████████░  9.0/10
```

---

## Wat ER AL Staat (huidige sterkte)

### Security ✅ Sterk

1. **Column-level grants** op `users` en `bookings` (migratie 011 + 018)
   - 9 publieke kolommen op `users`, rest service-role only
   - `bookings` UPDATE beperkt tot operationele kolommen
2. **Webhook idempotency** met TOCTOU-bestendigheid (migratie 024)
   - `processed_webhook_events` met status (processing/done/failed) + 5-min staleness
3. **SSRF-protection** op user-submitted URL's (avatars, studio images, iCal)
4. **RLS audit** uitgevoerd 2026-04-11 + 2026-04-15
   - 36/36 lctnships-tabellen RLS aan
   - 3 tabellen 0-policies → migratie 029 nodig (`studio_images`, `studio_amenities`, `transactions`)
5. **PII-leak fix** in checkout RSC (commit `c69728a`) — `select("id, full_name, email, phone")` ipv `*`
6. **Atomic cancel-flow** — Stripe refund eerst, dan DB update via service-client
7. **Stripe checkout server-recalc** voorkomt client-side price manipulation

### Code Quality ✅ Goed

- TypeScript op alle source files
- ESLint 9 flat-config + pre-commit hooks
- Geen dode code volgens scan
- `npx tsc --noEmit` schoon
- Logger abstraction (`src/lib/logger.ts`)
- Format helpers gecentraliseerd (`format-locale.ts`)
- Booking-duration single source of truth (`booking-duration.ts`)

### Test Coverage ✅ Voldoende

- **Smoke** (5 tests) — homepage, navigation, become-host, explore, images
- **Host calendar** (6 tests) — auth-redirect + authenticated views + bookings render
- **Renter projects** (7 tests) — list + detail + CTAs
- **Messages** (6 tests) — both sides + reply + RLS peer-view
- **Booking flows** (5 tests) — instant + on-request + approve + reject + pay-gating
- **Services** (5 tests) — host CRUD + renter pick + booking integration

**Wat ontbreekt:**
- Stripe sandbox tests (mock Stripe events end-to-end)
- Cross-domain auth tests (kan pas in Fase 2)
- Performance budget tests
- Visual regression

### Documentation ✅ Goed

- `CLAUDE.md` (root) — accurate project context
- `docs/SECURITY-REPORT.md` — 2026-04-11 audit
- `docs/MIGRATION-PLAN.md` + `ROADMAP.md` + `TICKETS.md` (dit document)
- Inline comments alleen waar de "why" non-obvious is (niet over-gecommenteerd)

---

## Wat NOG Moet (naar 9.0/10)

### 🔴 Pre-launch (kritiek)

| Gap | Ticket | Hoe |
|---|---|---|
| Multi-app architectuur | LCN-100..134 | 3 fases evolutie (3 weken) |
| Cross-domain auth | LCN-113 | `.lctnships.com` cookie-domain |
| RLS-policies voor 3 tabellen zonder | LCN-029 (mig) | `studio_images`, `studio_amenities`, `transactions` |
| OWASP Top 10 deep audit | LCN-140 | `/security-review` skill ná Fase 3 |
| Lighthouse ≥85 mobiel | LCN-141 | Bundle analysis, image optimization, RSC |
| Production runbook | LCN-145 | Rollback procedure + on-call + status page |

### 🟠 Post-launch (week 1-3)

| Gap | Hoe |
|---|---|
| CSP headers + security headers | `next.config.ts` headers config |
| `npm audit` clean | Dependency review pre-launch |
| Sentry + alerting setup | Vercel integration |
| A11y WCAG AA pass | Keyboard nav + ARIA review |
| Stripe sandbox E2E suite | Tegen Stripe test mode |

### 🟡 Backlog (post-launch maand 1-3)

- PostGIS + geo-search RPC (LCN-200) — als studio-aantal > 500
- Advisory locks voor double-booking (LCN-201) — als incidenten optreden
- Push notificaties (LCN-202)
- Visual regression tests
- Performance budget enforcement in CI

---

## OWASP Top 10 Status

| Categorie | Status | Notes |
|---|---|---|
| A01 Broken Access Control | 🟢 Strong | RLS op alle 36 lctnships-tabellen, column-grants |
| A02 Cryptographic Failures | 🟢 By design | Supabase TLS, Stripe handelt card data |
| A03 Injection | 🟢 By design | Supabase parameterized, geen raw SQL in app code |
| A04 Insecure Design | 🟢 Strong | Manual approve voor on-request, idempotent webhooks |
| A05 Security Misconfig | 🟡 Pending | CSP headers nog niet — LCN-140 |
| A06 Vulnerable Components | 🟡 Unknown | `npm audit` nog niet recent gedraaid — LCN-140 |
| A07 Auth Failures | 🟢 Good | Supabase Auth + middleware + open-redirect validation |
| A08 Data Integrity | 🟢 Good | `.env*` git-ignored, Vercel env management |
| A09 Logging Failures | 🟡 Partial | Logger bestaat, audit trail niet expliciet — overweeg LCN-055 post-launch |
| A10 SSRF | 🟢 Strong | Allowlist + private IP block + 10s timeout op alle outbound |

---

## Performance Baseline (te meten voor launch)

| Metric | Doel | Huidig |
|---|---|---|
| Lighthouse Performance (mobiel) | ≥ 85 | onbekend |
| LCP | < 2.5s | onbekend |
| FID/INP | < 200ms | onbekend |
| CLS | < 0.1 | onbekend |
| Bundle size (initial JS) | < 250kB gzip | onbekend |
| API p95 latency | < 500ms | onbekend |

**Actie (LCN-141):** baseline meten in week 21, optimalisaties in week 22.

---

## Trajectory

```
Apr 15 (vandaag)   6.8  ◀── live monoliet, 33 E2E, RLS audit, security review
                    │
                    │  Fase 1: Monorepo-ify (3 dagen)
                    ▼
Apr 22             6.8  ──── geen UX-verandering, basis voor refactor
                    │
                    │  Fase 2: Split host/renter naar subs (10 dagen)
                    ▼
May 06             7.5  ──── parallel infra, 0 cutover impact yet
                    │
                    │  Fase 3: Cutover + cleanup (5 dagen)
                    ▼
May 20             8.5  ──── single source of truth per domein
                    │
                    │  Fase 4: Hardening (5 dagen) + buffer
                    ▼
May 27             9.0  ──── audit-passed, Lighthouse ≥85
                    │
                    ▼
May 29             🚀   LAUNCH

Maand 1 post       9.2  ──── PostGIS, advisory locks, Sentry tuning
Maand 3 post       9.5  ──── full A/B toolkit, mobile native (v2)
```

---

## Volgende Audit

Na **M5** (cutover voltooid, 2026-05-20): full OWASP herleer + RLS audit + Lighthouse + bundle analysis. Resultaat in nieuwe sectie van dit document.

---

*Bijgewerkt na elke milestone (M1..M6). Niet bij elke commit.*
