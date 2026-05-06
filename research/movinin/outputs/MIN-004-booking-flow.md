# MIN-004 — Movinin Booking Flow (Search → Confirmation)

Trace of the renter booking flow in the Movinin monorepo at `~/Desktop/movinin/`. Stack: Express + Mongoose backend, React (Vite) frontend, Stripe Checkout (embedded) **or** PayPal (env-switched), Nodemailer + Expo push for notifications. **Single-tenant Stripe — no Connect, no platform fee split.**

---

## Stage 1 — Search

### Frontend
- **Page:** `frontend/src/pages/Search.tsx` — holds `location`, `from`, `to`, `agencies`, `types`, `rentalTerms` in component state, passes them as props to `<PropertyList>`.
- **List component:** `frontend/src/components/PropertyList.tsx` → `fetchData(_page)` (line 80) builds a `GetPropertiesPayload` and calls `PropertyService.getProperties`.
- **Service:** `frontend/src/services/PropertyService.ts` → `getProperties(data, page, size)` (line 13) does `POST /api/frontend-properties/:page/:size` with the payload in the body.

### Backend
- **Route:** `backend/src/routes/propertyRoutes.ts:19` — `routes.route(routeNames.getFrontendProperties).post(propertyController.getFrontendProperties)` (no auth required).
- **Path:** `/api/frontend-properties/:page/:size` (config: `backend/src/config/propertyRoutes.config.ts:11`).
- **Controller:** `backend/src/controllers/propertyController.ts:838` — `getFrontendProperties`.

### Payload
```ts
GetPropertiesPayload {
  agencies: string[]      // selected agency IDs (filter)
  types: string[]         // property type filter
  rentalTerms: string[]   // DAILY|WEEKLY|MONTHLY|YEARLY
  location: string        // location ObjectId
  from: Date              // required, throws if missing
  to: Date                // required, throws if missing
}
```

### DB operations / business rules
1. Validate `from` and `to` are present (throws otherwise).
2. Resolve the location plus its **child locations**: `Location.find({ $or: [{ _id }, { parentLocation: _id }] })`.
3. `Property.aggregate([...])` pipeline:
   - `$match`: `agency ∈ agencies`, `location ∈ locationIds`, `type ∈ types`, `rentalTerm ∈ rentalTerms`, `available: true`, `hidden: false`.
   - `$lookup` agency from `User` (filter `blacklisted: false`) + `$unwind`.
   - **Overlap-aware availability filter** (lines 940–989): `$lookup` on `Booking` for any booking on the same property whose `[from, to]` overlaps the requested window AND `status ∈ [Paid, Reserved, Deposit]`. If `property.blockOnPay === true` AND `overlappingBookings.length > 0` → property is excluded.
   - Optional `$addFields.dailyPrice` via server-side JS `$function` (gated by `env.DB_SERVER_SIDE_JAVASCRIPT`) to normalise weekly/monthly/yearly prices for sorting.
   - `$facet`: `resultData` (paginated) + `pageInfo.totalRecords`.
   - Collation: `{ locale: env.DEFAULT_LANGUAGE, strength: 2 }` for case/diacritic-insensitive sort.
4. Strip the agency object down to `{ _id, fullName, avatar }` before responding.

---

## Stage 2 — Listing detail

### Frontend
- **Page:** `frontend/src/pages/Property.tsx:100` — `PropertyService.getProperty(propertyId)`.
- **Service:** `PropertyService.ts:26` — `GET /api/property/:id/:language`.

### Backend
- **Route:** `backend/src/routes/propertyRoutes.ts:16` — public (no JWT).
- **Controller:** `backend/src/controllers/propertyController.ts:609` — `getProperty`.

### DB operations
```ts
Property.findById(id)
  .populate<{ agency }>('agency')                   // full User doc (then trimmed)
  .populate<{ location }>({
    path: 'location',
    populate: { path: 'values', model: 'LocationValue' },  // i18n names
  })
  .lean()
```
- Localises `property.location.name` by picking the `LocationValue` whose `language === language` param.
- Trims `agency` to `{ _id, fullName, avatar, payLater }` — `payLater` is the host-level flag that decides if the "pay at agency" option appears at checkout.
- Returns `204` if not found.

---

## Stage 3 — Date selection / availability check

There is **no separate availability endpoint**. Availability is enforced only inside the search aggregation (Stage 1) via the `overlappingBookings` `$lookup`.

- On `Property.tsx`, `from`/`to` come in via router `state` from the previous Search page; the date pickers' `minDate`/`maxDate` are derived only from those passed-in dates and `new Date()`. There is no real-time AJAX availability poll.
- The booking write endpoint (`/api/checkout`) does **not** re-validate that the property is still free for the requested window — race condition possible between search render and checkout submission.
- Only the search list filters out conflicting properties (and only when `property.blockOnPay === true`). If `blockOnPay` is false (default), overlapping bookings are not blocked at all.

---

## Stage 4 — Checkout init

### Frontend
- **Page:** `frontend/src/pages/Checkout.tsx`.
- On submit (`onSubmit` ~line 220):
  1. If unauthenticated: validates email, phone, birth date, recaptcha (if enabled), TOS checkbox.
  2. Builds the renter object (only when not authenticated — guest checkout).
  3. Converts the displayed `price` to `BASE_CURRENCY` via `movininHelper.convertPrice`.
  4. Builds the `Booking` payload `{ agency, property, renter?, location, from, to, status: Pending, cancellation, price }`.
  5. **If not pay-later** AND `env.PAYMENT_GATEWAY === Stripe`: calls `StripeService.createCheckoutSession` (line 315) → gets `{ sessionId, customerId, clientSecret }`. The embedded Stripe checkout is then mounted via `clientSecret`.
  6. Else if PayPal: defers to PayPal SDK (`PayPalService.createOrder` after booking row is created).
  7. Calls `BookingService.checkout(payload)` → `POST /api/checkout`.

### Backend — `/api/checkout`
- **Route:** `backend/src/routes/bookingRoutes.ts:9` — `routes.route(routeNames.checkout).post(bookingController.checkout)` (no JWT — guest-friendly).
- **Controller:** `backend/src/controllers/bookingController.ts:162` — `checkout`.
- **Logic:**
  1. If `body.renter` present → create new `User` (forced `verified: false`, `blacklisted: false`), save, generate activation `Token`, send activation email via `mailHelper.sendMail`.
  2. Else look up existing user by `body.booking.renter`.
  3. Branching on payment mode:
     - **`payLater` true** → no payment validation. Booking is created and immediately confirmed (see step 5).
     - **`paymentIntentId` present** → `stripeAPI.paymentIntents.retrieve(paymentIntentId)`; if `status !== 'succeeded'` → 400. Else `booking.status = Paid` and `booking.paymentIntentId` is set.
     - **`sessionId` present (Stripe Checkout flow)** → booking is saved as **temporary**: `status = Void`, `expireAt = now + BOOKING_EXPIRE_AT`. The final status flip to `Paid` happens in Stage 5 (`/api/check-checkout-session/:sessionId`). The renter user record gets the same TTL `expireAt` if not yet `verified`.
     - **`payPal` true** → similar pending state, finalised by PayPal endpoints.
  4. Save the `Booking` document.
  5. If pay-later or already-paid (`Paid + paymentIntentId + customerId`): send renter confirmation email (`confirm()` line 102) + `notify()` agency + `notify()` admin (in-app `Notification` row + counter + email).
  6. Return `{ bookingId: booking._id }`.

### Stripe Checkout Session creation (`/api/create-checkout-session`)
- **Route:** `stripeRoutes.ts` → `stripeController.createCheckoutSession` (`backend/src/controllers/stripeController.ts:21`).
- **Steps:**
  1. `stripeAPI.customers.list({ email })` → reuse or create.
  2. `stripeAPI.checkout.sessions.create({ ui_mode: 'embedded', line_items: [{ price_data: { unit_amount: amount * 100, currency }}], mode: 'payment', return_url: '<FRONTEND_HOST>/checkout-session/{CHECKOUT_SESSION_ID}', customer, locale, expires_at })`.
  3. Returns `{ sessionId, customerId, clientSecret }` to the frontend.
- **No `transfer_data`, no `application_fee_amount`, no destination charges** — single-tenant Stripe account.
- **Price is taken straight from the request body** (`amount`) — there is no server-side recompute against the property document. (Compare lctnships, which recomputes from `studio.price_per_hour` with a 2% tolerance.)

---

## Stage 5 — Payment

### Stripe APIs in use
1. **Stripe Checkout (embedded mode)** — primary web flow. `ui_mode: 'embedded'` + `clientSecret` rendered inline. After the in-page payment, Stripe redirects to `return_url = /checkout-session/{CHECKOUT_SESSION_ID}` where `CheckoutSession.tsx` mounts.
2. **Stripe PaymentIntents** — used by the mobile / native flow (`createPaymentIntent` controller line 198 → `paymentIntents.create({ automatic_payment_methods: { enabled: true, allow_redirects: 'never' } })`). The mobile client confirms the intent locally, then passes `paymentIntentId` into `/api/checkout`, which validates server-side via `paymentIntents.retrieve`.
3. **No Stripe Connect**, no `transfer_data`, no `account` header, no `application_fee_amount`. Funds settle to one platform Stripe account; payouts to agencies are out-of-band.

### Webhook flow
**There is no Stripe webhook handler.** `grep -rn "constructEvent\|webhook" backend/src` returns nothing. Payment confirmation is **pull-based**:
- Client lands on `/checkout-session/:sessionId` (`frontend/src/pages/CheckoutSession.tsx`).
- `useEffect` calls `StripeService.checkCheckoutSession(sessionId)` → `POST /api/check-checkout-session/:sessionId`.
- Backend (`stripeController.ts:98`) does:
  1. `stripeAPI.checkout.sessions.retrieve(sessionId)`; 204 if not found.
  2. `Booking.findOne({ sessionId, expireAt: { $ne: null } })`; 204 if no temp booking.
  3. If `session.payment_status === 'paid'`: clear `expireAt`, set `status = Paid`, save; clear renter `expireAt`; send confirmation email + agency/admin notifications; return 200.
  4. Else: `booking.deleteOne()` and return 400 with the payment status.

Implication: if the renter never re-opens the return URL, the booking sits as `Void` with an `expireAt` TTL index that auto-deletes the row after `BOOKING_EXPIRE_AT` seconds (Mongo TTL on the `Booking.expireAt` field, declared in `backend/src/models/Booking.ts:82`).

---

## Stage 6 — Confirmation (booking state machine)

`BookingStatus` enum values: `Void`, `Pending`, `Deposit`, `Paid`, `Reserved`, `Cancelled` (`backend/src/models/Booking.ts:39-49`).

State transitions for the renter checkout flow:

| Trigger | From | To | Where |
|---|---|---|---|
| Checkout submitted, Stripe Checkout Session path | (none) | `Void` (with TTL `expireAt`) | `bookingController.checkout:237` |
| Checkout submitted, PaymentIntent succeeded | (none) | `Paid` | `bookingController.checkout:227` |
| Checkout submitted, pay-later | (none) | `Pending` (sent in body, default in frontend) → kept | `Checkout.tsx:290` + `bookingController.checkout` |
| Stripe Checkout return URL pinged | `Void` | `Paid`, `expireAt` cleared | `stripeController.checkCheckoutSession:132` |
| Stripe Checkout payment failed/expired | `Void` | row **deleted** (or auto-expired by TTL) | `stripeController.checkCheckoutSession:182` |
| Renter cancels (cancellation policy on) | any | unchanged status, `cancelRequest = true` (agency must act) | `bookingController.cancelBooking:947` |
| Agency `updateStatus` | any | one of the enum values | `bookingController.updateStatus` (line 496) |

Key fields set on confirmation:
- `status = Paid`
- `expireAt = undefined` (TTL removed, document persists)
- `paymentIntentId` (PayPal path: `paypalOrderId`) and `customerId` are stored
- Linked `User.expireAt` is also cleared so the guest account becomes permanent

---

## Stage 7 — Email / notification

### Transactional emails (via `mailHelper.sendMail` → Nodemailer SMTP)
1. **Account activation email** — sent to the renter on guest checkout (`bookingController.checkout:184`). Contains link to `/activate?u=&e=&t=<token>`.
2. **Booking confirmation email** — `bookingController.confirm()` (line 102). Sent to renter on:
   - Pay-later checkout success (immediate).
   - Stripe PaymentIntent path (immediate, in `checkout`).
   - Stripe Checkout session path (deferred, fired from `stripeController.checkCheckoutSession` once payment is confirmed).
   - Body includes property name, agency name, address, Google Maps link, from/to formatted in renter locale.
3. **Agency notification email** — sent via `notify()` (line 54). Subject = the notification message; body links to `<ADMIN_HOST>/update-booking?b=<id>`. Only sent if the agency has `enableEmailNotifications`.
4. **Admin notification email** — same `notify()` helper, fired only if `env.ADMIN_EMAIL` is set and matches an existing admin user.
5. **Cancel-request email** — when renter calls `/api/cancel-booking/:id`, agency + admin get a `CANCEL_BOOKING_NOTIFICATION` mail.
6. **Booking-updated email** — `notifyRenter()` (line 313) when an agency edits the booking; renter receives an email if `enableEmailNotifications`.

### In-app notifications
- `Notification` document inserted with `{ user, message, booking }`.
- `NotificationCounter` upserted with `count++` (used for the bell badge).
- Triggered for: agency on new booking, admin on new booking, agency+admin on cancel request, renter on agency-side update.

### Push notifications (Expo)
- Only on agency-driven booking updates (`notifyRenter:355`): looks up `PushToken` for the renter and sends an Expo push via `expo.sendPushNotificationsAsync`. **No push on booking creation or payment confirmation.**

---

## Sequence diagram

```mermaid
sequenceDiagram
    actor Renter
    participant Frontend as Frontend (React)
    participant Backend as Backend (Express)
    participant Stripe
    participant Email as Nodemailer/Expo

    Renter->>Frontend: Pick location + dates (Search)
    Frontend->>Backend: POST /api/frontend-properties/:page/:size
    Backend->>Backend: Property.aggregate (location tree, $lookup Booking overlap, $facet)
    Backend-->>Frontend: properties + totalRecords

    Renter->>Frontend: Open property
    Frontend->>Backend: GET /api/property/:id/:language
    Backend->>Backend: Property.findById().populate(agency, location.values)
    Backend-->>Frontend: property

    Renter->>Frontend: Click "Book" -> /checkout
    alt Stripe Checkout (web)
        Frontend->>Backend: POST /api/create-checkout-session {amount, currency, email}
        Backend->>Stripe: customers.list/create + checkout.sessions.create (embedded)
        Stripe-->>Backend: sessionId, clientSecret
        Backend-->>Frontend: {sessionId, customerId, clientSecret}
        Frontend->>Backend: POST /api/checkout {booking, sessionId, customerId, renter?}
        Backend->>Backend: User.save (guest) + Booking.save (status=Void, TTL=expireAt)
        Backend-->>Email: activation email (guest)
        Backend-->>Frontend: {bookingId}
        Frontend->>Stripe: Embedded checkout UI -> pay
        Stripe-->>Frontend: redirect /checkout-session/:sessionId
        Frontend->>Backend: POST /api/check-checkout-session/:sessionId
        Backend->>Stripe: checkout.sessions.retrieve
        Stripe-->>Backend: payment_status=paid
        Backend->>Backend: booking.status=Paid, expireAt=null; user.expireAt=null
        Backend-->>Email: confirm renter + notify agency + notify admin
        Backend-->>Frontend: 200
    else PaymentIntent (mobile)
        Frontend->>Backend: POST /api/create-payment-intent
        Backend->>Stripe: paymentIntents.create
        Stripe-->>Backend: clientSecret
        Backend-->>Frontend: {paymentIntentId, clientSecret, customerId}
        Frontend->>Stripe: confirmPayment(clientSecret)
        Stripe-->>Frontend: succeeded
        Frontend->>Backend: POST /api/checkout {booking, paymentIntentId, customerId}
        Backend->>Stripe: paymentIntents.retrieve (verify succeeded)
        Backend->>Backend: Booking.save status=Paid
        Backend-->>Email: confirm renter + notify agency + notify admin
        Backend-->>Frontend: {bookingId}
    else Pay later
        Frontend->>Backend: POST /api/checkout {booking, payLater:true}
        Backend->>Backend: Booking.save status=Pending
        Backend-->>Email: confirm renter + notify agency + notify admin
        Backend-->>Frontend: {bookingId}
    end
```

---

## Comparison vs lctnships

- **Marketplace economics:** lctnships uses Stripe Connect with `transfer_data` + 15% application fee (85/15 split, hosts onboard via Connect Express); Movinin is single-tenant Stripe — agencies are paid out-of-band, no Connect.
- **Payment finalisation:** lctnships uses a signed Stripe webhook (`/api/stripe/webhook`) with idempotency via `processed_webhook_events`; Movinin polls `checkout.sessions.retrieve` from the return URL and relies on a Mongo TTL index on `Booking.expireAt` to garbage-collect abandoned `Void` bookings.
- **Server-side price recompute:** lctnships recomputes the booking subtotal from `studio.price_per_hour` (or matching `booking_blocks` row) with a 2% tolerance and rewrites the booking's financial fields via the admin client; Movinin trusts the `amount` sent in the request body. Combined with the lack of a real-time availability re-check at checkout, the Movinin flow has weaker integrity guarantees than lctnships'.
