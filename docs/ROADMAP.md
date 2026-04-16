# Roadmap — Launch eind mei 2026

**Benadering:** strangler-fig evolutie (zie [MIGRATION-PLAN.md](./MIGRATION-PLAN.md))
**Start:** 2026-04-15
**Target Launch:** 2026-05-29 (vrijdag, week 22)
**Laatst bijgewerkt:** 2026-04-15

---

## Timeline Overview

```
Apr 15    Apr 22    Apr 29    May 06    May 13    May 20    May 27
  │         │         │         │         │         │         │
  ├─ F1 ────┤         │         │         │         │         │
  │ Mono-   │         │         │         │         │         │
  │ repoify │         │         │         │         │         │
  │         ├─ F2 ────────────────┤         │         │         │
  │         │ Split + subdomeinen │         │         │         │
  │         │         │         │         │         │         │
  │         │         │         ├─ F3 ─────┤         │         │
  │         │         │         │ Cutover  │         │         │
  │         │         │         │         │         │         │
  │         │         │         │         ├─ F4 ─────────────┤
  │         │         │         │         │ Hardening + buffer│
  │         │         │         │         │         │         │
  M1        M2        M3        M4        M5        M6       🚀
```

---

## Milestones

| # | Milestone | Target datum | Gate |
|---|---|---|---|
| M1 | Monorepo live | 2026-04-22 | `turbo dev` + `turbo build` + 33/33 tests, zelfde Vercel deploy |
| M2 | `host.lctnships.com` gestart | 2026-04-29 | Host kan inloggen op sub, cross-domain cookie werkt |
| M3 | `app.lctnships.com` gestart | 2026-05-06 | Renter boekt via sub, Stripe checkout werkt, webhook canonical blijft |
| M4 | Dual-URL parallel stabiel | 2026-05-13 | Beide oude `/host` én sub-URLs live, SSO tussen alle 3, geen 5xx-spike |
| M5 | Cutover voltooid | 2026-05-20 | Redirects actief, `apps/web` afgeslankt, security-audit groen |
| M6 | Launch-ready | 2026-05-27 | Lighthouse ≥ 85 mobiel, Sentry schoon, 33+ E2E tests groen |
| 🚀 | **Launch** | 2026-05-29 | DNS final, monitoring dashboard, runbook klaar |

## Buffer

Tussen M6 en launch → **2 dagen buffer** voor bugs die uit staging komen.
Vanaf launch → **3 weken post-launch** gereserveerd voor hardening (geen nieuwe features).

---

## Fase 1 — Monorepo-ify (week 17, 2026-04-15 → 2026-04-22)

| Dag | Tickets | Output |
|---|---|---|
| Dag 1 (di 15) | LCN-100, LCN-101 | Turborepo workspaces, `apps/web` = huidige `src/` |
| Dag 2 (wo 16) | LCN-102, LCN-103 | `packages/shared` + `packages/supabase` extracted |
| Dag 3 (do 17) | LCN-104, LCN-105 | `packages/stripe` + `packages/ui` extracted |
| Dag 4 (vr 18) | LCN-106 | Tests + deploy verificatie, CI pipeline |

**Gate M1:**
- [ ] `turbo dev --filter=web` start :3002
- [ ] `turbo build` slaagt
- [ ] `npx playwright test` → 33/33 groen
- [ ] `npx tsc --noEmit` schoon
- [ ] Vercel productie-deploy = identiek aan pre-monorepo
- [ ] Lighthouse score niet gedaald

---

## Fase 2 — Split naar subdomeinen (week 18-19, 2026-04-22 → 2026-05-06)

### Week 18: Host app

| Dag | Tickets | Output |
|---|---|---|
| Dag 5 (ma 21) | LCN-110 | `apps/host` scaffold + Vercel project setup |
| Dag 6 (di 22) | LCN-111, LCN-112 | Host routes gekopieerd, auth middleware |
| Dag 7 (wo 23) | LCN-113 | Cross-domain cookies (`.lctnships.com`) |
| Dag 8 (do 24) | LCN-114 | Supabase Auth + Google OAuth + Stripe redirect URIs |
| Dag 9 (vr 25) | LCN-115 | Host E2E-tests tegen sub-URL |

**Gate M2:** host login op `host.lctnships.com` werkt, SSO met `lctnships.com` intact.

### Week 19: Renter app

| Dag | Tickets | Output |
|---|---|---|
| Dag 10 (ma 28) | LCN-120 | `apps/renter` scaffold |
| Dag 11 (di 29) | LCN-121, LCN-122 | Renter routes gekopieerd, booking-flow verificatie |
| Dag 12 (wo 30) | LCN-123 | Stripe Checkout werkt vanuit sub, webhook canonical |
| Dag 13 (do 01) | LCN-124 | Renter E2E-tests tegen sub |
| Dag 14 (vr 02) | LCN-125 | 48u parallel monitoring, geen 5xx-spike |

**Gate M3:** renter booking end-to-end via `app.lctnships.com`.

---

## Fase 3 — Cutover (week 20, 2026-05-05 → 2026-05-12)

| Dag | Tickets | Output |
|---|---|---|
| Dag 15 (ma 05) | LCN-130 | Feature-flag redirects 301 aangezet (staged, 10% traffic) |
| Dag 16 (di 06) | LCN-131 | 100% redirects, monitoring 24h |
| Dag 17 (wo 07) | LCN-132 | `apps/web` afgeslankt tot marketing |
| Dag 18 (do 08) | LCN-133 | Regression E2E — alle oude paths in sub-apps |
| Dag 19 (vr 09) | LCN-134 | CLAUDE.md bijgewerkt, ADR's geschreven |

**Gate M5:** zero orphaned redirects, Sentry error rate < 0.1%.

---

## Fase 4 — Hardening + buffer (week 21-22, 2026-05-12 → 2026-05-29)

| Dag | Tickets | Output |
|---|---|---|
| Dag 20-21 (ma-di) | LCN-140 | Security audit (OWASP + RLS + Stripe) |
| Dag 22 (wo) | LCN-141 | Lighthouse + Core Web Vitals — target LCP < 2.5s mobiel |
| Dag 23 (do) | LCN-142 | Error boundaries, 404/500 pages, toasts |
| Dag 24 (vr) | LCN-143 | Accessibility pass (WCAG AA basics) |
| Dag 25-26 (ma-di) | LCN-144 | Seed-data + staging smoke-tests |
| Dag 27 (wo) | LCN-145 | Runbook — rollback procedure, on-call contacts |
| Dag 28-29 (do-vr) | **BUFFER** | Niks inplannen, bugs uit staging |

**Gate M6 = Launch-ready.**

---

## Rating Trajectory

```
Datum       Score   Beschrijving
─────────────────────────────────────────────
Apr 15      6.0     Live monoliet, 33 E2E, 28 migraties (huidig)
Apr 22      6.2     Monorepo, zelfde URL's (M1)
Apr 29      6.8     host.lctnships.com live (M2)
May 06      7.5     Beide subs live, parallel monitoring (M3)
May 13      8.0     Cutover staged, redirects actief (M4)
May 20      8.5     Marketing web afgeslankt (M5)
May 27      9.0     Audits passed, Lighthouse ≥ 85 (M6)
May 29      —       LAUNCH 🚀
Jun+        9.2+    Post-launch hardening, analytics, A/B toolkit
```

---

## Risico's & Mitigaties

| Risico | Impact | Mitigatie |
|---|---|---|
| Cross-domain cookie breekt SSO | Users moeten 3× inloggen | Test in Fase 2 dag 7 (LCN-113), rollback via feature-flag |
| Stripe webhook mist tijdens cutover | Payments halverwege orphaned | Webhook-endpoint **niet** wisselen — canonical op `www.lctnships.com/api/stripe/webhook` |
| DNS TTL propagatie | Users op oude IP na cutover | Pre-lower TTL 24h voor cutover (→ 300s) |
| RLS policy regressie bij route-verplaatsing | Renter ziet host data / vice versa | E2E auth-suite draait elke deploy |
| Vercel cold-start op 3 apps | Trage eerste load per app | Edge runtime voor API routes, UptimeRobot ping elke 5min |
| Supabase PostgREST schema cache mist nieuwe kolom | 500's na migratie | Migraties altijd additief, geen DROP's, `NOTIFY pgrst, 'reload schema'` |
| Team ziek tijdens cutover-week | Launch wegvalt | 2-dagen buffer in week 22, Plan-B = launch op monoliet |

## Plan B (als het spaak loopt)

Als in Fase 2/3 iets fundamenteels breekt (cookie-hell, Vercel quota, Stripe-issue):
- Zet redirects uit
- Users blijven op `lctnships.com` — zelfde UX als nu
- Launch op 29 mei op de **monoliet** (huidige staat)
- Rebuild-werk gaat de zomer in, rustig, zonder launch-druk

Dit is altijd een optie. We zijn pas bij "geen terugweg" in Fase 3 na stap 17 (afslanken web).
