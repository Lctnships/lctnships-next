# MIN-001 — Repository Structure Scan

**Repo:** Movinin (https://github.com/aelassas/movinin)
**Local clone:** `~/Desktop/movinin/`
**Scanned:** 2026-04-29

---

## 1. Folder tree (max 3 levels)

```
movinin/
├── __config/                    # Shared TS configs (tsconfig base, etc.)
├── __scripts/                   # Build/install/setup scripts
├── __services/                  # Misc service helpers
├── admin/                       # Admin React+Vite app (port 3003)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── common/
│       ├── components/
│       ├── config/
│       ├── context/
│       ├── lang/
│       ├── layout/
│       ├── pages/
│       ├── services/
│       ├── main.tsx             # Entry point
│       └── App.tsx
├── backend/                     # Express API (Node + MongoDB)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/
│   │   ├── lang/
│   │   ├── common/
│   │   ├── strategies/          # Auth strategies
│   │   └── index.ts             # Entry point (Express + Sentry)
│   └── tests/
├── frontend/                    # Renter-facing React+Vite app (port 3004)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── common/
│       ├── components/
│       ├── config/
│       ├── context/
│       ├── lang/
│       ├── pages/
│       ├── services/
│       ├── main.tsx             # Entry point
│       └── App.tsx
├── mobile/                      # Expo React Native app (port 8081)
│   ├── app/
│   │   └── _layout.tsx          # Expo Router root layout (entry)
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── lang/
│   ├── miscellaneous/
│   ├── services/
│   ├── app.config.ts
│   ├── babel.config.js
│   └── eas.json
├── packages/                    # Shared internal packages
│   ├── currency-converter/
│   ├── disable-react-devtools/
│   ├── movinin-helper/          # Shared helper functions
│   ├── movinin-types/           # Shared TypeScript types
│   └── reactjs-social-login/    # OAuth social login
├── docker-compose.yml           # Production compose
├── docker-compose.dev.yml       # Dev compose
├── codecov.yml
├── README.md
└── LICENSE
```

---

## 2. Monorepo identification

**Type:** Manual monorepo — **no formal monorepo tool** (no Lerna, Turbo, Nx, pnpm workspaces, or Yarn workspaces).

**Mechanism:**
- Each app (frontend, admin, backend, mobile) has its own `package.json` with its own `node_modules`.
- Shared code in `packages/*` is referenced via **TypeScript path aliases** in `__config/tsconfig*.json` and per-app `tsconfig.json`.
- No root `package.json` workspaces field.
- `__scripts/` contains shell scripts that orchestrate installs/builds across apps.

**Implication:** Dependencies are duplicated across apps. There is no single source-of-truth lockfile; each app pins its own versions. This is a clear scalability concern (compared to Turborepo or pnpm workspaces).

---

## 3. Per-package overview

| Package | Path | Purpose | Key scripts |
|---|---|---|---|
| **frontend** | `/frontend/` | Renter-facing web app (search, book, manage rentals) | `dev` (Vite, port 3004), `build`, `preview`, `lint` |
| **admin** | `/admin/` | Admin/host dashboard web app | `dev` (Vite, port 3003), `build`, `preview`, `lint` |
| **backend** | `/backend/` | REST API (Express + Mongoose + Sentry) | `dev` (nodemon + ts-node), `start`, `build` (tsc), `test` (Jest) |
| **mobile** | `/mobile/` | Expo React Native app for renters | `start` (expo), `android`, `ios`, `web`, `eas-build-*` |
| **movinin-types** | `/packages/movinin-types/` | Shared TS types/interfaces (User, Booking, Property, etc.) | `build` (tsc) |
| **movinin-helper** | `/packages/movinin-helper/` | Shared utility functions (joinURL, formatters, validators) | `build` (tsc) |
| **currency-converter** | `/packages/currency-converter/` | Currency conversion helper | `build` |
| **reactjs-social-login** | `/packages/reactjs-social-login/` | OAuth social login wrapper (Google, Facebook, Apple) | `build` |
| **disable-react-devtools** | `/packages/disable-react-devtools/` | Disable React DevTools in production | `build` |

---

## 4. Entry points

| App | Entry file | Runtime | Default port |
|---|---|---|---|
| **Frontend (renter)** | `/frontend/src/main.tsx` | Vite dev / Vite preview / static build served | **3004** |
| **Admin** | `/admin/src/main.tsx` | Vite dev / Vite preview / static build served | **3003** |
| **Backend** | `/backend/src/index.ts` | Node.js (ts-node in dev, compiled JS in prod). Initializes Express, Sentry, MongoDB connection, mounts routes. | **4002** (or env-configured) |
| **Mobile** | `/mobile/app/_layout.tsx` | Expo Router (file-based routing). Boots through `expo-router/entry`. | **8081** (Metro) |

---

## 5. Shared code

Shared code lives in `/packages/` and is referenced **via TypeScript path aliases**, not via npm/workspace links.

| Package | What it provides | Used by |
|---|---|---|
| `movinin-types` | All shared interfaces (User, Booking, Property, Agency, Location, etc.) | All 4 apps |
| `movinin-helper` | URL joining, date formatting, price helpers, validation | All 4 apps |
| `currency-converter` | Currency conversion logic | frontend, admin, mobile |
| `reactjs-social-login` | OAuth provider wrappers | frontend, admin |
| `disable-react-devtools` | Production hardening | frontend, admin |

**How it's wired:** Each app's `tsconfig.json` extends the base in `__config/` and adds path mappings like `"@movinin/types": ["../packages/movinin-types/src"]`. Vite/Expo must be configured to resolve these too (Vite via `vite.config.ts` aliases, Expo via metro/babel config).

**Drawback for adoption:** This is fragile — every time a shared package changes, every app must rebuild its own copy. A real workspace tool (pnpm/Turborepo) would be a clear upgrade.

---

## Key takeaways for the lctnships comparison

1. **Splits frontend & admin into separate apps** — lctnships has both renter and host UI in a single Next.js app via route groups. Movinin's split is heavier (two Vite builds) but more isolated.
2. **No monorepo tool** — a weakness; lctnships has the simpler advantage of being a single Next.js app with no cross-app sync needed.
3. **Separate backend (Express)** — lctnships has API routes inside Next.js. Movinin has a clear API/frontend separation, which is more flexible but adds operational complexity.
4. **Mobile via Expo Router** — Movinin has a working Expo + native build pipeline (EAS). If lctnships ever adds a mobile app, this is a credible pattern to copy.
5. **Shared types via path aliases** — works but brittle. If we ever monorepo-ize lctnships, use pnpm workspaces or Turborepo from day one.
