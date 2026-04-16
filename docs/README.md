# lctnships — Documentation

Planning + architectuur docs voor de transitie van de huidige monoliet naar het Turborepo multi-app model, zonder launch in gevaar te brengen.

| Document | Doel |
|---|---|
| [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) | **Start hier** — 3-fase strangler-fig plan naar de doelarchitectuur |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Doelarchitectuur (Turborepo, 3 apps, shared packages) — target state |
| [ROADMAP.md](./ROADMAP.md) | Timeline, milestones, en launch-gate naar eind mei 2026 |
| [TICKETS.md](./TICKETS.md) | Concrete tickets (LCN-prefix) die tot launch moeten |
| [REPORT.md](./REPORT.md) | Baseline health van de huidige codebase + target scores |
| [SECURITY-REPORT.md](./SECURITY-REPORT.md) | Security-audit 2026-04-11 (RLS, Stripe, column grants) |

## Leesvolgorde voor iemand die erin moet stappen

1. **ARCHITECTURE.md** — begrijp wat we willen bereiken
2. **MIGRATION-PLAN.md** — begrijp hoe we daar komen zonder live-risico
3. **ROADMAP.md** — zie de timeline
4. **TICKETS.md** — pak een ticket op
5. **REPORT.md** — referentie voor kwaliteits-gates

## Projectcontext

- **Status:** live op `https://www.lctnships.com`
- **Supabase:** `ytmkmiofoluespwysfxa` (eu-west-1)
- **Stripe:** Connect live, 15% platform fee, webhook-idempotent
- **Tests:** 33 Playwright E2E groen (smoke, host-calendar, messages, projects, booking-flows, services)
- **Launch-doel:** eind mei 2026
