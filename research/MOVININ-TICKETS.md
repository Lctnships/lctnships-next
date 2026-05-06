# MOVININ-TICKETS.md

**Goal:** Systematisch scannen, begrijpen en documenteren van de Movin'In codebase als kandidaat-fundament voor lctnships.

**Repo:** https://github.com/aelassas/movinin
**Local clone:** `~/Desktop/movinin/`
**License:** MIT
**Stack:** Node.js + MongoDB + React + React Native
**Prefix:** `MIN-`
**Total tickets:** 12 across 3 fases
**Output dir:** `research/movinin/outputs/`

---

## Werkwijze

Tickets worden uitgevoerd via Claude Code agents die de Movinin clone scannen en een markdown output genereren. Per ticket:
1. Agent draait de prompt tegen `~/Desktop/movinin/`
2. Output wordt opgeslagen als `research/movinin/outputs/MIN-XXX-output.md`
3. Ticket wordt afgevinkt in dit bestand
4. Wanneer alle 12 klaar zijn → vul `COMPARISON.md` in

---

## Fase 1 — Discovery (3 tickets)

### `[x]` MIN-001 — Repository Structure Scan
**Doel:** Volledige folder-map en monorepo layout begrijpen
**Output:** `research/movinin/outputs/MIN-001-structure.md`
**Acceptance:** Tree (max 3 levels) + package overzicht + entry points

---

### `[x]` MIN-002 — Tech Stack Inventory
**Doel:** Volledige stack in kaart, vergelijkbaar met lctnships
**Output:** `research/movinin/outputs/MIN-002-stack.md`
**Acceptance:** Tabel per categorie (frontend, backend, mobile, shared, payments, storage, email, devops) met versies

---

### `[x]` MIN-003 — Database Schema Mapping
**Doel:** Datamodel begrijpen om met lctnships Supabase schema te vergelijken
**Output:** `research/movinin/outputs/MIN-003-database.md`
**Acceptance:** Volledig modeloverzicht (velden, relaties, indexes, validators) + mermaid ER-diagram

---

## Fase 2 — Feature Deep-dives (6 tickets)

### `[x]` MIN-004 — Booking Flow End-to-End
**Doel:** Hele booking lifecycle in kaart brengen (search → checkout → payment → confirmation)
**Output:** `research/movinin/outputs/MIN-004-booking-flow.md`
**Acceptance:** Mermaid sequence diagram + file paths per stap

---

### `[x]` MIN-005 — Multi-host Architecture
**Doel:** Vergelijken met lctnships' Supabase RLS multi-tenancy
**Output:** `research/movinin/outputs/MIN-005-multi-host.md`
**Acceptance:** Permission model + concrete file paths

---

### `[x]` MIN-006 — Stripe Integration
**Doel:** Vergelijken met lctnships' Stripe Connect 85/15 flow
**Output:** `research/movinin/outputs/MIN-006-stripe.md`
**Acceptance:** Volledige payment architecture + gap-analyse vs Stripe Connect

---

### `[x]` MIN-007 — Availability & Calendar Logic
**Doel:** Vergelijken met lctnships' advisory-lock conflict prevention
**Output:** `research/movinin/outputs/MIN-007-availability.md`
**Acceptance:** Conflict-prevention strategie + race condition assessment

---

### `[x]` MIN-008 — Mobile App Architecture
**Doel:** Beoordelen of Movinin's RN apps een fundament kunnen vormen
**Output:** `research/movinin/outputs/MIN-008-mobile.md`
**Acceptance:** Mobile architectuur + code-sharing assessment

---

### `[x]` MIN-009 — Search & Filter Implementation
**Doel:** Vergelijken met lctnships' explore page performance
**Output:** `research/movinin/outputs/MIN-009-search.md`
**Acceptance:** Query patterns + index strategie + cache layer

---

## Fase 3 — Comparison Prep (3 tickets)

### `[x]` MIN-010 — Feature Inventory
**Doel:** Definitieve feature lijst voor de COMPARISON.md matrix
**Output:** `research/movinin/outputs/MIN-010-features.md`
**Acceptance:** Tabel klaar om naar COMPARISON.md te kopiëren

---

### `[x]` MIN-011 — Architecture Diagrams
**Doel:** Visueel overzicht voor de comparison
**Output:** `research/movinin/outputs/MIN-011-diagrams.md`
**Acceptance:** Drie renderbare mermaid diagrams (system, data flow, auth flow)

---

### `[x]` MIN-012 — Performance & Scalability Assessment
**Doel:** Eerlijke inschatting of dit fundament kan schalen voor lctnships
**Output:** `research/movinin/outputs/MIN-012-performance.md`
**Acceptance:** Score table (1-10 per punt) + concrete bottleneck voorspellingen bij 1000 hosts × 100 bookings/dag

---

## Wanneer alle 12 tickets klaar zijn

→ Open `COMPARISON.md` (zelfde directory) en vul de Movin'In kolom in op basis van outputs.

---

## Status

- **Started:** 2026-04-29
- **Last updated:** 2026-04-29
- **Completed tickets:** 12 / 12 ✅ — proceed to `COMPARISON.md`
