# MIN-007 — Availability, Calendar Logic, and Double-Booking Prevention

Repo: `~/Desktop/movinin/`
Scope: Backend (Express + Mongoose + MongoDB) — `backend/src/`

---

## TL;DR

Movinin has **no first-class calendar/availability subsystem**. Availability is computed implicitly from existing `Booking` documents at search time, and the booking creation path performs **no overlap check at all**. There is no advisory locking, no transaction, no unique compound index, and no iCal import/export. Two concurrent renters can both reach Stripe Checkout for the same property and the same dates, and both bookings will be saved without error. The only mitigation is the per-property `blockOnPay` flag, which causes future search results to filter out properties whose paid bookings overlap the requested range — but that runs only on the search aggregation, not at write time.

---

## 1. Where Is Unavailability Stored?

**Confirmed: no separate "blocked dates" collection.** MIN-003's finding stands.

`backend/src/models/` contains 10 Mongoose models: `Booking`, `Country`, `Location`, `LocationValue`, `Notification`, `NotificationCounter`, `Property`, `PushToken`, `Token`, `User`. There is no `BlockedDate`, `Availability`, `Calendar`, or `BlockedRange` collection.

`Property` (`backend/src/models/Property.ts`) has a single boolean field that approximates manual unavailability:

```ts
available: { type: Boolean, default: true }
```

This is a global on/off switch for the entire listing — it does not represent a date range. There is also `hidden: Boolean`, which hides a property from search but does not affect booking writes.

A commented-out block in `bookingController.ts:268-271` hints at an old intent to flip `available: false` after a paid booking, gated by a `MARK_PROPERTY_AS_UNAVAILABLE_ON_CHECKOUT` flag — but it is dead code and the env var doesn't exist in `env.config.ts`.

### Implications

- **Unavailability is derived, not stored.** A property is "unavailable" for a date range only because there is a `Booking` document with that property + an overlapping `from`/`to` and a status in `{Paid, Reserved, Deposit}`.
- **Hosts cannot block dates manually for non-platform reasons** (off-market, personal use, maintenance). The only knob is the global `Property.available` boolean.
- **No external (Airbnb/VRBO) bookings can be reflected** without creating fake `Booking` rows.
- **The host's own time off** has no representation. lctnships solves this with `studio_blocked_dates` (manual + iCal-imported rows). Movinin has nothing.

---

## 2. Double-Booking Prevention

### 2a. Booking creation flow

There are two write paths into the `Booking` collection:

1. **`POST /booking/create`** — agency-authenticated admin path. `bookingController.ts:31-42`:

```ts
export const create = async (req, res) => {
  try {
    const { body } = req
    const booking = new Booking(body)
    await booking.save()
    res.json(booking)
  } catch (err) {
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
```

No overlap query. No transaction. No status check on `req.body.status`. The agency can save any `from`/`to` for any property.

2. **`POST /booking/checkout`** — public renter checkout path. `bookingController.ts:162-304`. The handler:
   - Optionally creates a User document
   - Verifies the Stripe `paymentIntentId` if present (`paymentIntents.retrieve` → status === `'succeeded'`)
   - Sets `booking.expireAt = now + STRIPE_SESSION_EXPIRE_AT + 600s` if the Stripe Checkout session is still open
   - Calls `new Booking(body.booking).save()`

There is **no `Booking.find({ property, from, to })` overlap query anywhere** in this handler. I grep'd `bookingController.ts` for `overlap`, `conflict`, `available`, `Booking.find`, `$or`, `withTransaction`, `startSession` — the only `available` hits are in the dead commented block (lines 268-270). The only place that actually checks for overlap is the **search aggregation** in `propertyController.ts:940-989`, used by `getFrontendProperties` to filter the explore page — i.e., the check runs on read, not write.

### 2b. Transaction / advisory locks

None. `mongoose.startSession()` and `session.withTransaction(...)` do not appear anywhere in `bookingController.ts`, `stripeController.ts`, or `paypalController.ts`. Each save is a single-document write at default write concern.

### 2c. Unique compound index

None. `bookingSchema` (`backend/src/models/Booking.ts:7-90`) declares these indexes:

- `agency: { index: true }` — single-field
- `renter: { index: true }` — single-field
- `sessionId: { index: true }` — single-field
- `expireAt: { name: 'expireAt', expireAfterSeconds: env.BOOKING_EXPIRE_AT, background: true }` — TTL only

There is **no** `bookingSchema.index({ property: 1, from: 1, to: 1 }, { unique: true })` — and a naive uniqueness like that wouldn't catch overlap anyway (it would only catch exact-equality duplicates). What you'd actually need is application-level locking + an exclusion-style range check, which Movinin does not have.

### 2d. Race condition assessment

**Yes, two concurrent requests can both succeed.** The flow is:

```
Request A: POST /booking/checkout { property: X, from: T1, to: T2 } → save() → 200
Request B: POST /booking/checkout { property: X, from: T1, to: T2 } → save() → 200
```

Both saves succeed independently; both write `Booking` documents with status `Void` (and `expireAt` set). When the renters complete Stripe Checkout, both get flipped to `Paid` by `stripeController.checkCheckoutSession`. Each renter receives a confirmation email, the agency receives two notifications, and the property is now double-booked.

The aggregation in `getFrontendProperties` will subsequently hide the property from search results because both bookings are now `Paid` and overlap any further searches — but the existing two paid renters are not refunded or notified by the system.

The TTL index (`expireAt`) does **not** mitigate this: it only deletes a `Void` booking after `STRIPE_SESSION_EXPIRE_AT + 600s` if no payment ever lands. If both renters pay before the TTL fires (which is the realistic case for any concurrent demand), both bookings persist.

There is **no compensating flow** for race-loss: no webhook that detects two paid bookings for the same property+range, no operator alert, no automatic refund. An operator has to spot it manually in the agency dashboard.

### 2e. Search-time overlap check (the only real protection — not a write protection)

`propertyController.ts:940-989` uses an aggregation `$lookup` to filter properties out of explore-page search results when:

- `property.blockOnPay !== false` (default `true`, see `Property.ts:133-136`) AND
- there is a `Booking` with status in `{Paid, Reserved, Deposit}` whose `[from, to]` overlaps the requested `[from, to]`

The overlap predicate is the standard one:

```js
$not: [{
  $or: [
    { $lt: ['$to',   new Date(from)] },  // booking ends before window starts
    { $gt: ['$from', new Date(to)] }     // booking starts after window ends
  ]
}]
```

This is correct overlap math. But:

- It runs on the **explore search**, not at the time of `Booking.save()`. A renter who already has a deep-link to `/property/:id` and posts directly to `/booking/checkout` bypasses this check entirely.
- `Pending` and `Void` statuses are excluded — so two people both with `Void` bookings (Stripe session in progress) don't filter each other out, even on search.
- The default `blockOnPay = true` was added as a per-property opt-out so an agency can list a property as searchable even while it has paid bookings (e.g., for a multi-unit complex). When `blockOnPay = false`, no overlap filtering happens at all.

---

## 3. iCal Import / Export

**No support whatsoever.**

`grep -rn -i "ical\|\.ics\|iCal" backend/src/ frontend/src/` returns zero matches related to calendars. The hits are unrelated comments about Mongo TTL ("automatically deleted").

There is no:

- iCal import endpoint (Movinin has no equivalent of lctnships' `/api/calendar/import/[studioId]`)
- iCal export endpoint (no equivalent of `/api/calendar/ical/[studioId]`)
- `node-ical`, `ical-generator`, `ics` package in `package.json`
- Field on `Property` for an external feed URL (no equivalent of `studios.wix_calendar_url` or `studios.meetingpackage_calendar_url`)

A host who lists their property on Airbnb in parallel cannot mirror that calendar into Movinin. Conflicts are inevitable for multi-platform hosts.

---

## 4. Timezones

### 4a. Storage

`Booking.from` and `Booking.to` are plain `Date` types (`Booking.ts:31-38`). MongoDB stores `Date` as 64-bit ms-since-epoch (UTC), so the moment is stored unambiguously — but the **intended local wall-clock time of the host's property is not stored**. There is no `timezone` column on `Property` and no `timezone` column on `Booking`.

### 4b. Display

`bookingController.confirm()` (`bookingController.ts:102-151`) renders `from`/`to` for confirmation emails using:

```ts
const options = {
  weekday: 'long', month: 'long', year: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric',
  timeZone: env.TIMEZONE,
}
const from = booking.from.toLocaleString(locale, options)
```

`env.TIMEZONE` (`env.config.ts:335`) is a single global `MI_TIMEZONE` env var, default `'UTC'`. There is **one timezone for the entire deployment**, not per-property. If an agency in Lisbon and an agency in Casablanca share the same Movinin instance, all confirmation emails render times in whichever zone the operator chose at deploy time.

### 4c. Probable bugs

- **DST crossings.** A reservation `from = 2026-03-29 02:30` (a wall-clock that doesn't exist in CET because of DST spring-forward) will be silently coerced to a different UTC moment depending on whether the client constructed the `Date` in local or UTC mode. With `MI_TIMEZONE='UTC'` (default) this is fine; with anything else, host and renter wall-clock displays can differ by an hour from each other across DST.
- **Cross-timezone hosts.** A renter in Madrid booking a property in Marrakech sees the same email times — both rendered in `MI_TIMEZONE`. If the operator deploys with `MI_TIMEZONE='Europe/Paris'`, a Marrakech renter sees their booking in Paris time, which may be off by 1–2 hours.
- **Date-only semantics.** `from`/`to` are stored as full `Date` (with hours/minutes), but Movinin's UI is a date picker (no time picker). The `from`/`to` ms-precision implies a 00:00 boundary that's effectively "midnight in whose zone?" The frontend sets it from a `DatePicker` on the user's machine, so a user in Tokyo selecting "Apr 5" sends a different UTC moment than a user in Los Angeles selecting "Apr 5" — and the overlap aggregation compares those UTC moments without zone correction.

### 4d. lctnships comparison

lctnships uses `start_datetime`/`end_datetime` with explicit hourly granularity, plus `src/lib/format-locale.ts` helpers that take an explicit `locale` parameter (BCP47) for rendering. lctnships has the same "no per-studio timezone" gap, but its hourly model and stricter use of `formatDate(date, locale)` makes it less ambiguous than Movinin's date-only-but-stored-as-Date approach.

---

## 5. Buffer / Block Periods

**No concept.** There is no field on `Property` for a turnover/cleaning gap, no minimum-gap-between-bookings constant, and no extra padding in the overlap aggregation. If booking A ends at `2026-04-05T14:00Z` and booking B starts at `2026-04-05T14:00Z`, both would be allowed (the overlap predicate uses strict `<` and `>`). The `propertyController.ts` aggregation predicate is:

```
NOT ( booking.to < requested.from  OR  booking.from > requested.to )
```

Equivalent to: bookings that touch at the boundary are considered non-overlapping. Lctnships has the same gap-less model.

---

## 6. Status Transitions and "Pending Holds"

The `BookingStatus` enum has six values: `Void`, `Pending`, `Deposit`, `Paid`, `Reserved`, `Cancelled`.

### Transitions observed in code

| Status | Set by | When |
|---|---|---|
| `Void` | `bookingController.checkout` (line 237) | Renter clicks "pay with Stripe", Booking is created **before** payment, with `expireAt` TTL |
| `Pending` | (only set by agency manually via `update`/`updateStatus` routes) | Not auto-set by checkout flow |
| `Paid` | `bookingController.checkout` (line 227) when a `paymentIntentId` is verified `succeeded`; `stripeController.checkCheckoutSession` (line 134); `paypalController.ts:81` | Payment succeeded |
| `Deposit` | Agency manual | Partial payment received offline |
| `Reserved` | Agency manual | "Pay later" or hold |
| `Cancelled` | `bookingController.cancelBooking` | Renter or agency cancels |

### Does `Pending` block another booking?

**No.** The search-aggregation overlap filter at `propertyController.ts:966-970` only includes `{Paid, Reserved, Deposit}`:

```js
$in: ['$status', [
  movininTypes.BookingStatus.Paid,
  movininTypes.BookingStatus.Reserved,
  movininTypes.BookingStatus.Deposit,
]]
```

`Pending` and `Void` are explicitly excluded. So a renter mid-Stripe-checkout (`Void` status) does not prevent a parallel renter from initiating their own Stripe checkout for the same property and dates. Both will see the property as available in search; both will pass through `/booking/checkout`; both get to Stripe.

### Does `Void` (the in-flight checkout state) hold dates?

**Yes — but only via TTL deletion, not via the overlap filter.** The `Void` booking persists in the collection with `expireAt = now + STRIPE_SESSION_EXPIRE_AT + 600s` (default 23h + 10min). MongoDB's TTL monitor will delete the document if Stripe never confirms payment. But during those 23 hours, since `Void` is excluded from the search overlap filter, the property remains visible to other renters. So `Void` does **not** functionally hold dates against concurrent renters; it only holds the row long enough for Stripe to call back.

### lctnships comparison

lctnships uses a `pending → confirmed → completed/cancelled` flow with cron-driven cleanup (no MongoDB TTL — Postgres + scheduled job). Pending bookings do hold dates because the booking creation flow inserts a row that the search/availability check considers occupied.

---

## 7. Comparison Table — Movinin vs lctnships

| Aspect | Movinin | lctnships |
|---|---|---|
| Blocked-dates collection | No (derived from bookings) | Yes (`studio_blocked_dates`) |
| Manual host date blocking | No (only global `Property.available` boolean) | Yes (UI + `studio_blocked_dates` rows) |
| Overlap check on booking write | **None** — `Booking.save()` runs unconditionally | Yes (`/api/bookings/POST` checks blocked dates and existing bookings) |
| Overlap check on search | Yes — aggregation `$lookup` in `getFrontendProperties` | Yes — explore page filters by availability |
| Race condition prevention | None visible (app-level only, and there is no app-level check on the write path either) | Postgres advisory locks |
| Transaction wrapping create | No (`mongoose.startSession`/`withTransaction` not used) | Yes (admin client transactional inserts) |
| Unique compound index | No (only TTL on `expireAt` and singletons on `agency`/`renter`/`sessionId`) | Yes (composite indexes on `(host_id, status, start_datetime)` etc.) |
| iCal import | No | Yes (Wix + MeetingPackage, SSRF-protected) |
| iCal export | No | Yes (`/api/calendar/ical/[studioId]`) |
| Buffer time between bookings | No | No |
| Per-listing timezone | No (single global `MI_TIMEZONE` env var) | No (uses BCP47 locale per-request) |
| Pending booking holds dates | No — `Pending` and `Void` are excluded from overlap filter; only TTL deletion guards `Void` | Yes (with cron-driven cleanup) |
| Webhook idempotency | Implicit via TTL + `findOne({ sessionId, expireAt: { $ne: null } })` (not robust against retries after status flip) | Yes (`processed_webhook_events` unique-insert short-circuit) |
| Status enum | `Void / Pending / Deposit / Paid / Reserved / Cancelled` | `pending / confirmed / completed / cancelled` |
| Compensating flow on race-loss | None | Refund + notification flow exists |

---

## 8. Practical risk summary

For lctnships' purposes, Movinin is **not** a useful reference for availability/calendar correctness. It demonstrates:

- A correct overlap-math predicate (the search-time aggregation is textbook).
- A reasonable use of MongoDB TTL for cleaning up abandoned Stripe sessions.

But it lacks every other safeguard lctnships already has: blocked-dates collection, write-time overlap check, advisory locking, transactional financial-field updates, iCal interop, webhook idempotency. Anyone porting Movinin's booking flow into a higher-volume environment would hit double-booking incidents within the first week of concurrent demand.

The single takeaway worth borrowing: the `Property.blockOnPay` per-listing flag is a clean way to support "this is a multi-unit listing, paid bookings should not hide it from search." lctnships could reuse that pattern if/when multi-unit studio listings become a feature, but lctnships' current single-room model doesn't need it.
