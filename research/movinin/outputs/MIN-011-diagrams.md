# MIN-011: Movinin Architecture Diagrams

Source: `~/Desktop/movinin/` — verified via `docker-compose.yml`, `backend/.env.example`, `backend/src/app.ts`, `backend/src/controllers/*`, `backend/src/middlewares/authJwt.ts`, and route definitions.

Verified ports: Backend Express API on **4004** (`MI_PORT=4004`), Admin SPA on **3003**, Frontend SPA on **3004** (dev) / 8081 (docker), Mongo on **27017** (host-mapped to 27018).

---

## Diagram 1: System Architecture

```mermaid
flowchart LR
    Renter([Renter Browser])
    Agency([Agency / Admin Browser])
    MobileUser([Mobile User])

    subgraph Clients
        Frontend["Frontend SPA<br/>(Vite + React)<br/>:3004"]
        Admin["Admin SPA<br/>(Vite + React)<br/>:3003"]
        Mobile["Mobile App<br/>(Expo / React Native)"]
    end

    subgraph Server["Server Host"]
        Backend["Backend API<br/>(Express + TS)<br/>:4004"]
        CDN["Static CDN<br/>(/var/www/cdn)<br/>nginx in frontend<br/>container"]
    end

    Mongo[("MongoDB<br/>:27017<br/>movinin db")]

    Stripe[/"Stripe API<br/>(PaymentIntents)"/]
    PayPal[/"PayPal REST API<br/>(Orders + Capture)"/]
    SMTP[/"SMTP server<br/>(SendGrid / Nodemailer)"/]
    ExpoPush[/"Expo Push Service<br/>(exp.host)"/]
    Sentry[/"Sentry<br/>(@sentry/node)"/]
    IPInfo[/"IPInfo API<br/>(geo lookup)"/]

    Renter -->|HTTPS| Frontend
    Agency -->|HTTPS| Admin
    MobileUser -->|HTTPS| Mobile

    Frontend -->|HTTP REST<br/>x-access-token| Backend
    Admin -->|HTTP REST<br/>x-access-token| Backend
    Mobile -->|HTTP REST<br/>x-access-token| Backend

    Frontend -->|HTTPS GET<br/>property images| CDN
    Admin -->|HTTPS GET<br/>property images| CDN
    Mobile -->|HTTPS GET<br/>property images| CDN

    Backend -->|MongoDB wire<br/>Mongoose| Mongo
    Backend -->|writes uploads| CDN

    Backend -->|HTTPS<br/>Stripe SDK| Stripe
    Backend -->|HTTPS REST| PayPal
    Backend -->|SMTP :587<br/>Nodemailer| SMTP
    Backend -->|HTTPS<br/>expo-server-sdk| ExpoPush
    Backend -->|HTTPS<br/>error events| Sentry
    Backend -->|HTTPS GET| IPInfo

    ExpoPush -.->|push delivery| Mobile
```

**Notable:** Movinin runs as four separate deployable units (frontend, admin, backend, mongo) plus a shared `cdn` Docker volume that the frontend nginx container serves directly — uploads are written by the backend but read straight from disk by clients, no signed URLs. All three clients hit one Express backend; there is no edge/gateway tier and no service mesh.

---

## Diagram 2: Data Flow — Renter Creates a Booking from Mobile

```mermaid
sequenceDiagram
    autonumber
    participant M as Mobile App<br/>(Expo)
    participant API as Backend Express<br/>:4004
    participant Auth as authJwt.verifyToken<br/>middleware
    participant Ctrl as bookingController.checkout
    participant S as Stripe API
    participant DB as MongoDB
    participant Mail as Nodemailer<br/>(SMTP)
    participant Push as Expo Push Service

    M->>API: POST /api/checkout<br/>x-access-token: <JWT>
    API->>Auth: verify JWT (HS256, MI_JWT_SECRET)
    Auth-->>API: req.user populated
    API->>Ctrl: handle checkout payload<br/>(renter, property, dates, payment)

    Ctrl->>Ctrl: validate input<br/>(dates, age >= MI_MINIMUM_AGE)

    alt Stripe payment selected
        Ctrl->>S: stripe.paymentIntents.retrieve(intentId)
        S-->>Ctrl: PaymentIntent { status }
        Note over Ctrl: only persist if status === 'succeeded'
    end

    Ctrl->>DB: Booking.create({ ...status: PENDING/PAID })
    DB-->>Ctrl: booking._id

    Ctrl->>Mail: sendMail(renter confirmation)
    Mail-->>Ctrl: ok

    Ctrl->>DB: PushToken.find({ user: agencyId })
    DB-->>Ctrl: [expoPushToken]
    Ctrl->>Push: expo.sendPushNotificationsAsync([msg])
    Push-->>Ctrl: ticketChunks

    Ctrl->>DB: Notification.insertMany(...)
    Ctrl-->>API: 200 { bookingId }
    API-->>M: 200 OK
```

**Notable:** The checkout controller is synchronous — Stripe verification, DB insert, email, and push all happen inside one request before responding. There is no webhook-driven idempotency layer like lctnships uses; instead Movinin relies on a TTL-style cleanup of "temporary" bookings whose Stripe session expires (see comments at `bookingController.ts:230`).

---

## Diagram 3: Auth Flow — Login + Protected Request

```mermaid
sequenceDiagram
    autonumber
    participant C as Client<br/>(Frontend / Admin / Mobile)
    participant API as Backend Express<br/>:4004
    participant UC as userController.signin
    participant DB as MongoDB
    participant MW as authJwt.verifyToken

    Note over C,API: ── Login ──
    C->>API: POST /api/sign-in/:type<br/>{ email, password, stayConnected }
    API->>UC: signin handler
    UC->>DB: User.findOne({ email })
    DB-->>UC: user doc (with hashed password)
    UC->>UC: bcrypt.compare(password, user.password)

    alt mismatch / blacklisted / inactive
        UC-->>C: 204 / 400 (no token)
    else match
        UC->>UC: jwt.sign({ id }, MI_JWT_SECRET,<br/>{ expiresIn: 86400s })
        UC-->>C: 200 { _id, email, fullName,<br/>accessToken }
        Note over C: Frontend / Admin → localStorage<br/>Mobile → AsyncStorage<br/>(stayConnected gates persistence)
    end

    Note over C,API: ── Subsequent protected request ──
    C->>API: GET /api/booking/:id<br/>x-access-token: <JWT>
    API->>MW: verifyToken
    MW->>MW: jwt.verify(token, MI_JWT_SECRET)

    alt invalid / expired
        MW-->>C: 401 / 403
    else valid
        MW-->>API: next() — req.user = decoded
        API->>DB: Booking.findById(id)<br/>(+ populate property, agency)
        DB-->>API: booking
        API-->>C: 200 { booking }
    end
```

**Notable:** Auth is pure JWT in a custom header (`x-access-token`), no refresh tokens and no rotation — `MI_JWT_EXPIRE_AT=86400` (24h) is the only expiry. There is also a parallel cookie-based path for OAuth (Apple/Google/Facebook) that sets an HTTP-only cookie scoped to `MI_AUTH_COOKIE_DOMAIN`, but the email/password path used by all three clients is header-only. Authorization beyond "is logged in" is enforced by separate `authAdmin` and `authAgency` middlewares that re-query the user record.

---

## How lctnships' architecture differs

Lctnships collapses Movinin's split frontend + admin + backend into a single Next.js 16 fullstack app on Vercel: the same codebase serves marketing, renter dashboard, host dashboard, and API routes (`src/app/api/*`), so there is no separate Express tier and no `x-access-token` header — auth is a Supabase session cookie refreshed by middleware. Persistence is Supabase Postgres (managed) instead of self-hosted MongoDB, and authorization is enforced in the database layer via Postgres column-level grants and RLS (e.g. only `service_role` can read `users.stripe_account_id`, only operational columns on `bookings` are user-updatable) rather than Movinin's "JWT-only + per-controller role middleware" model. Payments are Stripe Connect with a 15% platform fee and a webhook-driven idempotent flow (`processed_webhook_events`), versus Movinin's synchronous Stripe + PayPal in-request verification with no webhook ledger. File storage is Supabase Storage with SSRF-validated URLs instead of a shared `cdn` volume served by nginx, and observability/cron come from Vercel + Resend + Upstash rather than Sentry + Nodemailer + a manual scheduler.
