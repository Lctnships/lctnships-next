# MIN-002 — Tech Stack Inventory

**Repo:** Movinin v7.1.0
**Local clone:** `~/Desktop/movinin/`
**Scanned:** 2026-04-29

---

## 1. Frontend (web — renter-facing app)

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.x | UI library |
| `react-dom` | 19.x | React DOM renderer |
| `vite` | 8.x | Build tool / dev server |
| `react-router-dom` | 7.x | SPA routing |
| `@mui/material` | 7.x | UI component library |
| `@mui/icons-material` | 7.x | Icon set |
| `@mui/x-date-pickers` | latest | Date / date-range pickers |
| `@emotion/react`, `@emotion/styled` | latest | CSS-in-JS (MUI dependency) |
| `react-hook-form` | latest | Form state |
| `yup` | latest | Schema validation |
| `axios` | latest | HTTP client |
| `i18next`, `react-i18next` | latest | i18n |
| `date-fns` | latest | Date utilities |
| `@stripe/stripe-js`, `@stripe/react-stripe-js` | latest | Stripe Elements |
| `@paypal/react-paypal-js` | latest | PayPal Buttons |
| `leaflet`, `react-leaflet` | latest | Maps |
| `react-toastify` | latest | Toast notifications |
| (~29 runtime deps total, ~30 dev deps) | | |

**State management:** React Context (no Redux/Zustand). User state via `UserContext`.

---

## 2. Frontend (admin)

Same core as renter frontend, with additions:

| Package | Version | Purpose |
|---|---|---|
| `draft-js` | latest | WYSIWYG rich text editor |
| `react-draft-wysiwyg` | latest | Wrapper around Draft.js |
| `rrule` | latest | Recurring date rules (for availability) |

(~21 runtime deps, ~28 dev deps. Otherwise mirrors renter frontend.)

---

## 3. Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | 5.x | HTTP framework |
| `mongoose` | latest | MongoDB ODM |
| `jsonwebtoken` | latest | JWT auth |
| `bcrypt` | latest | Password hashing |
| `passport`, `passport-jwt`, `passport-google-oauth20`, `passport-facebook` | latest | OAuth strategies |
| `validator` | latest | Field validators |
| `multer` | latest | Multipart file uploads |
| `nodemailer` | latest | Transactional email |
| `stripe` | latest | Payments |
| `@paypal/checkout-server-sdk` | latest | PayPal payments |
| `@sentry/node` | latest | Error monitoring |
| `cors`, `helmet`, `compression` | latest | HTTP middleware |
| `winston` | latest | Logging |
| `expo-server-sdk` | latest | Push notifications |
| (~23 runtime deps, ~24 dev deps) | | |

**Validation:** Custom express middleware + Mongoose schema validators. No Joi/Zod at the API layer.
**Auth model:** JWT issued by backend, verified by `passport-jwt` middleware. Custom user store via Mongoose.

---

## 4. Mobile (Expo)

| Package | Version | Purpose |
|---|---|---|
| `expo` | 55.x | Expo SDK |
| `react-native` | 0.83.x | Core RN |
| `expo-router` | latest | File-based routing |
| `react-native-paper` | latest | UI library |
| `expo-localization`, `i18next`, `react-i18next` | latest | i18n |
| `expo-secure-store` | latest | Secure storage |
| `expo-notifications` | latest | Push notifications |
| `expo-image`, `expo-image-picker` | latest | Image handling |
| `expo-linking`, `expo-web-browser` | latest | OAuth redirects |
| `@stripe/stripe-react-native` | latest | Stripe payments |
| `react-native-paypal` (or web equivalent) | latest | PayPal |
| `axios` | latest | HTTP client |
| (~47 runtime deps, ~13 dev deps) | | |

**Build pipeline:** EAS Build for iOS/Android. `eas.json` defines preview, development, production profiles.

---

## 5. Shared (`/packages/`)

| Package | Purpose |
|---|---|
| `movinin-types` | TypeScript interfaces (User, Booking, Property, Agency, Location, etc.) shared across all 4 apps |
| `movinin-helper` | Utility functions: `joinURL`, formatters, validators |
| `currency-converter` | Currency conversion (wraps `easy-currencies`) |
| `reactjs-social-login` | OAuth social login wrapper (web only) |
| `disable-react-devtools` | Production hardening for web apps |

Shared packages are referenced via **TypeScript path aliases** — no workspace tool.

---

## 6. Payments

| Package | Used by | Purpose |
|---|---|---|
| `stripe` (Node SDK) | backend | Server-side Stripe API (checkout, webhooks) |
| `@stripe/stripe-js` | frontend, admin | Client-side Stripe.js loader |
| `@stripe/react-stripe-js` | frontend, admin | React Elements wrapper |
| `@stripe/stripe-react-native` | mobile | Native Stripe SDK |
| `@paypal/checkout-server-sdk` | backend | Server-side PayPal Orders v2 |
| `@paypal/react-paypal-js` | frontend, admin | PayPal Buttons |

**Note:** Movinin supports BOTH Stripe and PayPal. lctnships only supports Stripe.

---

## 7. Storage (image / file uploads)

| Package | Used by | Purpose |
|---|---|---|
| `multer` | backend | Multipart upload parser |
| Local filesystem + nginx (in docker-compose) | backend | Image storage. No S3 / CDN by default. |

**Gap vs lctnships:** lctnships uses Supabase Storage (object storage with CDN). Movinin stores images on the API server's filesystem — does not scale horizontally without an additional volume / S3 backend.

---

## 8. Email / Notifications

| Package | Used by | Purpose |
|---|---|---|
| `nodemailer` | backend | SMTP email |
| `expo-server-sdk` | backend | Send Expo push notifications to mobile devices |
| `react-toastify` | frontend, admin | In-app toast notifications |

**Gap vs lctnships:** lctnships uses Resend + React Email templates (typed, component-based). Movinin uses raw nodemailer + HTML strings — works but less maintainable.

---

## 9. DevOps / Tooling

| Area | Tool | Notes |
|---|---|---|
| Containerization | Docker | 6 Dockerfiles (dev + prod for each web app) |
| Orchestration | docker-compose | `docker-compose.yml` (prod), `docker-compose.dev.yml` (dev) |
| CI/CD | GitHub Actions | 7 workflows: build, test, containerize, releases, version bumping |
| Testing (backend) | `jest` + `supertest` | Backend integration tests |
| Testing (frontend) | None visible | No frontend tests in repo |
| Linting | `eslint@9.39`, `stylelint@17.4` | |
| Type checking | `typescript@5.9` | |
| Mobile build | EAS Build | `eas.json` |

---

## Stack vs lctnships at a glance

| Dimension | Movinin | lctnships |
|---|---|---|
| Frontend framework | Vite + React 19 (SPA) | Next.js 16 App Router (SSR/RSC) |
| Routing | React Router 7 | Next.js App Router |
| UI library | MUI v7 + Emotion | shadcn/ui + Tailwind v4 |
| State | React Context | Zustand + React Context |
| Data fetching | Axios in components / context | Server Components + Supabase queries |
| API layer | Separate Express backend | Next.js API routes (colocated) |
| Database | MongoDB + Mongoose | PostgreSQL + Supabase (raw queries) |
| Auth | Custom JWT + bcrypt + Passport | Supabase Auth (OAuth + magic link + MFA) |
| Authorization | Application-level role checks | Postgres RLS + column grants |
| Payments | Stripe + PayPal | Stripe Connect (85/15) only |
| File storage | Local filesystem + multer | Supabase Storage |
| Email | nodemailer (raw HTML) | Resend + React Email |
| Push notifications | Expo Server SDK (mobile only) | None |
| i18n | i18next + react-i18next | next-intl (5 locales) |
| Mobile | Expo + RN 0.83 | None (web-only) |
| Forms | react-hook-form + yup | react-hook-form + zod |
| Maps | Leaflet | Google Places (no map) |
| Monorepo tooling | None (TS path aliases) | N/A (single app) |
| CI/CD | GitHub Actions (7 workflows) | Vercel deploy + Playwright |
| Testing | Jest (backend only) | Playwright E2E (frontend) |
| Error monitoring | Sentry | None visible |

---

## Takeaways for lctnships

1. **lctnships has the better authorization story** — Postgres RLS + column-level grants is far stronger than Movinin's application-level role checks.
2. **Movinin has Sentry, lctnships does not** — adopting Sentry (or similar) would close a real observability gap.
3. **Movinin has push notifications, lctnships does not** — relevant only if/when we ship mobile.
4. **Movinin's PayPal integration** is a model if we ever add a second payment processor.
5. **Movinin's monorepo is a weakness, not a strength** — no workspace tool, manual sync via TS path aliases. Don't copy this.
6. **Stack-wise lctnships is more modern** (Next.js 16, RSC, Tailwind v4, Supabase, Resend, Zod). The slowness we feel is *not* a stack issue — it's a usage issue (data fetching patterns).
