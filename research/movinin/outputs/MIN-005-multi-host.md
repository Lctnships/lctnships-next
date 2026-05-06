# MIN-005 — Multi-Host / Multi-Tenancy in Movinin

Scope: backend at `~/Desktop/movinin/backend/`. All findings are confirmed against source. Compared at the end against lctnships' Postgres RLS + column-level grant model.

---

## 1. Host model — what represents a "host"?

**Confirmed: a host is a `User` document with `type === "Agency"`.** There is no separate `Agency`/`Host` collection.

`backend/src/models/User.ts`:
```ts
type: {
  type: String,
  enum: [movininTypes.UserType.Admin, movininTypes.UserType.Agency, movininTypes.UserType.User],
  default: movininTypes.UserType.User,
},
agency: {
  type: Schema.Types.ObjectId,
  ref: 'User',           // self-referential
},
```

The same `User` collection holds three roles via the `type` discriminator:

| `type`   | Meaning              |
|----------|----------------------|
| `Admin`  | Platform super-user  |
| `Agency` | Host (a "tenant")    |
| `User`   | Renter               |

### Sub-agents under an agency — yes

The `agency` field on the User schema is a self-reference to another `User._id`. Sub-users of type `User` (or any non-Admin) can be created with `user.agency = <Agency._id>`, making them members of that agency's tenant scope. This is wired up in:

- `backend/src/controllers/userController.ts:201` — `create`: an Agency creates a sub-user, body sets `agency` to the parent Agency's `_id`.
- `userController.ts:1037` — when an Agency updates a user, it can only touch users where `user.agency === sessionUserId`.
- `userController.ts:1635` — same constraint on delete.

There is no dedicated UI/role for "sub-agents". In practice, the `agency` field nests *renters* under a creating agency for backoffice management, not "sub-host" listing access. Listings (`Property`) and bookings (`Booking`) are scoped only to the top-level Agency, not to sub-agents.

`User` documents indexed on `(type, expireAt, fullName)` — the role tag is part of every hot query, which keeps tenant filtering cheap.

---

## 2. Listing ownership — how are properties scoped?

**Each `Property` document has a single `agency: ObjectId → User`** (`backend/src/models/Property.ts:24-29`):

```ts
agency: {
  type: Schema.Types.ObjectId,
  required: [true, "can't be blank"],
  ref: 'User',
  index: true,
},
```

There is no Mongo-level guarantee that an Agency can only edit its own properties. Enforcement is **purely application-level**, in the controller — see Section 3.

In `propertyController.ts`:

- `update` (line 224): loads `property` by `_id`, then:
  ```ts
  if (!sessionUser || (sessionUser.type === UserType.Agency
       && property.agency?.toString() !== sessionUserId)) {
    res.status(403).send('Forbidden: You cannot update this property')
    return
  }
  ```
- `deleteProperty` (line 441): identical pattern.
- `getProperties` (line 661): list filter is built from `body.agencies` (client-supplied!), no server-side override to `[sessionUserId]`. The `authAgency` middleware only verifies the role, not the requested filter scope. **A logged-in Agency could pass `body.agencies = [<other agency id>]` to list another agency's properties** — see Section 7.
- `getBookingProperties` (line 795): also takes `agency` from body, no override.

---

## 3. Permission boundary — where in the request lifecycle?

**Hybrid: middleware does role-gating only; ownership is enforced inside each controller.**

Two middleware functions in `backend/src/middlewares/authJwt.ts`:

| Middleware    | What it checks                                     |
|---------------|----------------------------------------------------|
| `verifyToken` | JWT in cookie/header, loads user, sets `req.user`  |
| `authAdmin`   | `req.user.type === Admin`                          |
| `authAgency`  | `req.user.type === Admin` OR `Agency`              |

Routes wire these in pairs (`propertyRoutes.ts:9-15`):

```ts
routes.route(routeNames.update).put(authJwt.verifyToken, authJwt.authAgency, propertyController.update)
```

`authAgency` only answers "is this user any agency?" — not "does this user own *this* resource?" The "does it own this row?" check lives **inside the controller body**, comparing `req.user._id` against the loaded document's `agency` field. The pattern repeats almost verbatim across `propertyController.update`, `propertyController.deleteProperty`, `bookingController.update`, `bookingController.deleteBookings`, `userController.update`, `userController.deleteUsers`, `userController.changePassword`, `agencyController.update`.

There is **no reusable ownership middleware** (no `requireOwnership(model, agencyField)` helper). Each controller hand-rolls the check. That's the central risk surface — see Section 7.

---

## 4. Admin / super-user — bypass behavior

The Admin role is differentiated by `User.type === 'Admin'`. The bypass logic is **encoded inline in every check** by structuring the conditional as:

```ts
if (!sessionUser || (sessionUser.type === UserType.Agency
     && property.agency?.toString() !== sessionUserId)) { /* deny */ }
```

This is "deny only if the user is an Agency AND not the owner". Admins (and any other non-User non-Agency type) **fall through and are allowed**. So Admins implicitly bypass agency boundaries for every resource. Notable confirmations:

- `propertyController.update:238`, `deleteProperty:450` — Admin passes through.
- `bookingController.update:437` — same pattern, plus explicitly excludes `UserType.User`.
- `bookingController.deleteBookings:543` — same.
- `userController.update:1067` — only Admins can change a user's `type` field.
- `agencyController.deleteAgency:131` — *only* Admin allowed (cascades and deletes all the agency's properties + bookings).
- `agencyController.update:68` — Agency can only update its own row, Admins can update any.

The Admin bypass is implicit (a side-effect of how the deny condition is written), not explicit. That's a code-smell: a future refactor that flips the boolean structure could silently break Admin access or, worse, accidentally grant Agency users wider scope.

---

## 5. Renter ↔ agency cross-cutting reads

When a renter (`User` type=`User`) books a property:

- `Booking` schema (`backend/src/models/Booking.ts`) stores **both** `agency: ObjectId → User` and `renter: ObjectId → User`. Both are indexed.
- The booking is created from the renter side via `bookingController.checkout` (the `/checkout` route, **no auth middleware** — guests can book) which copies the `agency` from the chosen Property.
- `bookingController.getBookings` (line 688) is the listing endpoint used by both the admin app and the frontend. It applies role-based filtering inside the handler:
  ```ts
  if (sessionUser.type === UserType.Agency) {
    agencies = [new mongoose.Types.ObjectId(sessionUserId)]   // override client list
  }
  if (sessionUser.type === UserType.User) {
    $match.$and!.push({ 'renter._id': { $eq: new ObjectId(sessionUser._id) } })
  }
  ```
  Admins keep whatever `body.agencies` they supply. This is the **one place** where the server forcibly overrides the client-supplied tenant filter — a stronger pattern than `propertyController.getProperties`, which trusts the body.

So Agency A sees its own bookings (override), Agency B sees its own (override), the renter sees only theirs (extra `$match` clause), Admin sees everything.

**Single-row read (`getBooking` at `bookingRoutes.ts:14`) has no auth middleware at all.** Anyone with the booking `_id` can `GET` it and receive the full booking + property + renter document.

---

## 6. Row-level vs application-level

**100% application-level.** MongoDB has no row-level security primitive. The `User` collection is shared across all roles, and every `Property`/`Booking` row is reachable by `_id`. The only thing standing between Agency A and Agency B's data is:

1. `verifyToken` — establishes `req.user`.
2. `authAgency` / `authAdmin` — role gate.
3. The hand-written `if (sessionUser.type === Agency && doc.agency !== sessionUserId)` block at the top of each mutating controller.
4. For listings, the controller manually rewriting the filter to `[sessionUserId]` (only `getBookings` does this; `getProperties` does not).

Compare: lctnships uses Postgres `GRANT` + RLS so that even if a route forgets the check, the database denies the read/write. Movinin has no such backstop — a forgotten `if` block silently leaks an entire tenant's data.

---

## 7. Risk surface — where authorization could leak

Three concrete, currently-shipped concerns:

### a) `propertyController.getProperties` — client-controlled tenant filter
File: `backend/src/controllers/propertyController.ts:661-784`
The handler passes `body.agencies` straight into the `$match` aggregation:
```ts
const agencies = body.agencies.map((id) => new mongoose.Types.ObjectId(id))
const $match = { $and: [{ agency: { $in: agencies } }, ...] }
```
A logged-in Agency can simply set `body.agencies = ["<other agency _id>"]` and read the other agency's full property list. The route is `authAgency`-gated, so Admins legitimately use this — but there's no equivalent of the override done in `getBookings` (line 718) for Agency callers. Same issue in `getBookingProperties` (line 795).

**Fix needed**: same override pattern as `getBookings` — if `sessionUser.type === Agency`, force `agencies = [sessionUserId]`.

### b) `bookingController.getBooking` and `getBookingId` — no auth
File: `backend/src/routes/bookingRoutes.ts:14-15`
```ts
routes.route(routeNames.getBooking).get(bookingController.getBooking)
routes.route(routeNames.getBookingId).get(bookingController.getBookingId)
```
No `verifyToken`. Anyone with the URL `/api/booking/:id/:language` (and the `_id`) can read the full booking, the renter's User document (populated, line 619), the agency, and the property. The only thing protecting it is `_id` being a 24-char hex (effectively unguessable, but enumerable via API mistakes / log leaks / referer headers). lctnships protects every booking GET via Supabase RLS + service-role-only sensitive columns.

### c) `bookingController.cancelBooking` — verified token but no ownership match
File: `backend/src/controllers/bookingController.ts:936-977`, route `bookingRoutes.ts:18`
```ts
routes.route(routeNames.cancelBooking).post(authJwt.verifyToken, bookingController.cancelBooking)
```
The handler does:
```ts
const booking = await Booking.findOne({ _id: new ObjectId(id) })
if (booking && booking.cancellation && !booking.cancelRequest) {
  booking.cancelRequest = true
  await booking.save()
  ...
}
```
There is no check that `booking.renter === req.user._id`. Any logged-in renter (or Agency, or Admin) who can guess a booking `_id` can flip the `cancelRequest` flag on someone else's booking. It doesn't refund or expose data, but it is a state-mutating cross-tenant action.

### Other places worth auditing
- `bookingController.create` (line 31) is `authAgency`-gated but has **zero ownership check**. An Agency can create a booking with `body.agency = <other agency>` and assign work to a competitor. (Frontend bookings flow through `checkout`, not `create`, but the surface is exposed.)
- `propertyController.create` (line 26) has the same shape — body.agency is trusted.
- `userController.getUser` (line 1193) is `verifyToken`-only, returns email/phone/birthDate/customerId of any user by `_id`.

---

## 8. Comparison vs lctnships

| Dimension                       | Movinin                                                     | lctnships                                                                 |
|---------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------|
| Tenancy model                   | `User.type=Agency` discriminator on a single `User` collection | `users.user_type` plus dedicated `studios.host_id` foreign key             |
| Authorization layer             | Express middleware (role only) + hand-written controller checks | Postgres RLS policies + column-level `GRANT` + service-role bypass for trusted server flows |
| Defense-in-depth                | None — if the controller forgets the check, data leaks      | Two layers: Supabase RLS denies the row, column grants deny sensitive fields |
| Sensitive column access        | Whatever the controller `.lean()` returns (e.g. `getUser` returns email/phone/birthDate by `_id`) | `phone`, `email`, `stripe_account_id`, `bank_*` etc. are unreadable by `authenticated`; only the admin client (after server-side `getUser()`) reads them |
| Cross-tenant filter for list endpoints | Mostly client-supplied (`body.agencies`); only `getBookings` overrides it server-side | `select … where host_id = auth.uid()` enforced by RLS regardless of client filter |
| Admin bypass                    | Implicit via boolean structure of inline checks; no audit trail | Service-role key (explicit, gated, server-only)                            |
| Webhook idempotency / financial integrity | Not enforced at DB level                                  | `processed_webhook_events` unique insert + column grants forbid clients from updating `total_amount`, `host_payout`, etc. |
| Auth surface for booking GET    | `getBooking` route is **unauthenticated**                   | All booking reads go through RLS-protected Supabase client                 |

### Verdict

**lctnships' model is materially stronger**, for two reasons:

1. **Defense-in-depth.** Postgres RLS + column-level `GRANT` mean that a forgotten check in an API route is recovered by the database. In Movinin, the database is wide-open to any code holding a Mongo connection — a single forgotten `if` block (or an unauthenticated route, of which there are several) leaks a tenant's data. We already have three concrete examples: `getProperties`, `getBooking`, `cancelBooking`.

2. **Sensitive-column isolation.** lctnships explicitly partitions which columns the `authenticated` Postgres role can read (9 public-profile fields on `users`); the rest (phone, email, stripe ids, bank info) require the admin client. Movinin has no such partition: `getUser` returns email/phone/birthDate to any logged-in caller by `_id`, and `getProperty` populates the agency's full User record before manually projecting it down (the populate happens before the projection — so a network attacker observing the DB query sees everything regardless).

Movinin's design is normal for a Mongoose+Express SaaS — it's not unsafe per se, but it is structurally fragile. The mitigation cost is real: every new mutation needs to repeat the 4-line ownership block, and the codebase already shows three places where the block is missing or weakened. Adopting an `requireOwnership(model, ownerField)` middleware (or moving to a Mongoose pre-find hook that injects `agency: req.user._id`) would close most of the gap, but cannot match RLS as a backstop because Mongo has no equivalent.

---

## Files referenced

- `~/Desktop/movinin/backend/src/models/User.ts`
- `~/Desktop/movinin/backend/src/models/Property.ts`
- `~/Desktop/movinin/backend/src/models/Booking.ts`
- `~/Desktop/movinin/backend/src/middlewares/authJwt.ts`
- `~/Desktop/movinin/backend/src/routes/propertyRoutes.ts`
- `~/Desktop/movinin/backend/src/routes/bookingRoutes.ts`
- `~/Desktop/movinin/backend/src/routes/userRoutes.ts`
- `~/Desktop/movinin/backend/src/routes/agencyRoutes.ts`
- `~/Desktop/movinin/backend/src/controllers/propertyController.ts` (lines 224, 441, 661, 795)
- `~/Desktop/movinin/backend/src/controllers/bookingController.ts` (lines 31, 424, 529, 599, 688, 936)
- `~/Desktop/movinin/backend/src/controllers/userController.ts` (lines 201, 1014, 1193, 1529, 1621)
- `~/Desktop/movinin/backend/src/controllers/agencyController.ts` (lines 56, 124)
