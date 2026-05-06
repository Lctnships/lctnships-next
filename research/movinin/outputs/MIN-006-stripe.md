# MIN-006 — Stripe Integration in Movinin

**Scope:** Reverse-engineered all Stripe-related code in `~/Desktop/movinin/` (backend Express API + frontend Vite/React app). Compared against lctnships' Stripe Connect 85/15 platform model.

**TL;DR:** Movinin uses Stripe **only as a single-tenant payment processor**. There is no Stripe Connect, no platform fee split, no webhook handler, no refund flow, and no idempotency layer. 100% of every successful charge lands in the platform owner's single Stripe account. Agency payouts are entirely off-Stripe (manual / out-of-band). lctnships is materially more advanced on every payment dimension.

---

## 1. File inventory

### Backend (`~/Desktop/movinin/backend/src/`)
| File | Lines | Purpose |
|---|---|---|
| `payment/stripe.ts` | 6 | One-line `new Stripe(STRIPE_SECRET_KEY)` singleton. No API version pin. |
| `controllers/stripeController.ts` | 256 | Three handlers: `createCheckoutSession`, `checkCheckoutSession`, `createPaymentIntent`. |
| `routes/stripeRoutes.ts` | 11 | Registers the three POST endpoints. |
| `config/stripeRoutes.config.ts` | — | Endpoint paths constants. |
| `controllers/bookingController.ts` | (lines 207–227) | At booking-create time, retrieves `paymentIntent` to verify `status === 'succeeded'` before marking the booking Paid. |
| `models/Booking.ts` | (lines 63–75) | Stores `sessionId`, `paymentIntentId`, `customerId`, `paypalOrderId` on the booking. |
| `models/User.ts` | (line 99) | Stores `customerId` on the user (renter). |
| `config/env.config.ts` | (lines 342–354) | `STRIPE_SECRET_KEY`, `STRIPE_SESSION_EXPIRE_AT` (default 82 800 s = 23 h). |

### Frontend (`~/Desktop/movinin/frontend/src/`)
| File | Purpose |
|---|---|
| `services/StripeService.ts` | Three thin axios wrappers calling the backend endpoints. |
| `pages/Checkout.tsx` | Renders embedded `EmbeddedCheckoutProvider` from `@stripe/react-stripe-js`. |
| `pages/CheckoutSession.tsx` | Polls `/api/check-checkout-session/:id` after Stripe's return URL. |
| `config/env.config.ts` | `VITE_MI_STRIPE_PUBLISHABLE_KEY`, `VITE_MI_PAYMENT_GATEWAY` (`stripe` or `paypal`). |

### What's NOT there
- No `stripe/webhook` route. No Express middleware for raw-body verification. No call to `stripeAPI.webhooks.constructEvent` anywhere.
- No `application_fee_amount`, no `transfer_data`, no `destination`, no `Stripe.Account`, no Connect onboarding.
- No `refund`, `refunds.create`, or `Refund` references.
- No subscriptions, no `stripeAPI.subscriptions`, no Customer Portal / billing portal.
- No idempotency key, no `processed_webhook_events`-equivalent table.

(Verified by grepping `transfer|application_fee|destination|Connect`, `webhook|Webhook`, `refund|Refund`, `subscription|customerPortal|billingPortal` across the entire backend tree — all returned zero hits or only the unrelated newsletter "subscription" string in the frontend.)

---

## 2. Stripe products used

| Product | Used? | Where |
|---|---|---|
| **Checkout Sessions** (embedded UI mode) | Yes | `createCheckoutSession` — `ui_mode: 'embedded'`, `mode: 'payment'`, `line_items` built ad-hoc from booking amount. |
| **PaymentIntents** | Yes (alternate path) | `createPaymentIntent` with `automatic_payment_methods.enabled = true, allow_redirects: 'never'`. Appears unused from the current frontend Checkout.tsx (which uses Checkout Sessions) — likely a legacy / mobile-app path. |
| **Customers** | Yes | Both handlers do `customers.list({ email })` and create one if missing. Customer ID is stashed on the user and on the booking. |
| **Connect (Express/Standard)** | **No** | Zero references. Single platform-owned Stripe account. |
| **Subscriptions** | No | Not used. |
| **Customer Portal / Billing Portal** | No | Not used. |
| **Stripe Tax / Adaptive pricing** | No | Tax is computed in app code (or not at all). |

`Checkout.tsx` chooses the gateway based on `env.PAYMENT_GATEWAY` (`stripe` vs `payPal`) at build time. There is no mixed-mode flow.

---

## 3. Payment splitting / platform fees — **NONE**

This is the headline finding.

```ts
// stripeController.ts createCheckoutSession – the entire create call
const session = await stripeAPI.checkout.sessions.create({
  ui_mode: 'embedded',
  line_items: [{ price_data: { product_data: { name }, unit_amount: Math.floor(amount * 100), currency }, quantity: 1 }],
  mode: 'payment',
  return_url: `${FRONTEND_HOST}/checkout-session/{CHECKOUT_SESSION_ID}`,
  customer: customer.id,
  locale: ...,
  payment_intent_data: { description },
  expires_at: expireAt,
})
```

Notice what is **not** there:
- No `payment_intent_data.application_fee_amount`
- No `payment_intent_data.transfer_data.destination`
- No `on_behalf_of`
- No subsequent `transfers.create()` to the agency

`createPaymentIntent` is identical in this regard — no fee, no destination.

**Implication:** every successful payment lands 100% in the platform-owner's Stripe balance. The agency that owns the property never sees Stripe money. Whatever revenue-share Movinin operators run with their agencies must be settled outside Stripe (bank transfer, invoice, etc.). The platform-fee math (Movinin's commission %) is not modelled anywhere in the codebase.

This is the **fundamental gap** vs lctnships: lctnships routes 85% to the host's Connect account and keeps 15% as `application_fee_amount` on the same charge, automatically.

---

## 4. Payouts to hosts (agencies) — **off-Stripe**

There is no payout module. No `stripeAPI.payouts.*`, no `stripeAPI.transfers.*`, no `stripeAccountId` field on the agency `User` document. The `User` model has only `customerId` (the renter-facing Stripe Customer ID).

Two practical operating options for whoever runs Movinin:
1. **Single Stripe account model** (default in this code): Stripe pays the platform; platform manually wires money to agencies.
2. **Each agency uses their own Stripe account**: requires per-agency `STRIPE_SECRET_KEY` env per environment, which is not supported by the current single-key design (`payment/stripe.ts` instantiates one global client from `env.STRIPE_SECRET_KEY`).

So in practice option 1 is the only one the current code supports. Agency payouts are an **operator problem**, not a code feature.

---

## 5. Webhook handling — **completely missing**

`grep -rin 'webhook' backend/src/` returns **zero results**. There is no `/api/stripe/webhook` route, no Express raw-body middleware, no `stripeAPI.webhooks.constructEvent` call, no signature verification, no idempotency table.

How Movinin compensates: a **client-driven polling pattern**.
1. Stripe redirects the renter to `${FRONTEND_HOST}/checkout-session/{CHECKOUT_SESSION_ID}`.
2. `CheckoutSession.tsx` calls `POST /api/check-checkout-session/:sessionId`.
3. The backend `checkCheckoutSession` controller does `stripeAPI.checkout.sessions.retrieve(sessionId)`, looks up the temp Booking by `sessionId`, and:
   - if `session.payment_status === 'paid'` → set booking status to `Paid`, clear the TTL `expireAt`, send confirmation emails to renter / agency / admin.
   - else → `await booking.deleteOne()`.

Failure modes this introduces (vs a webhook):
- If the renter closes the tab before the redirect, the booking gets garbage-collected by MongoDB's TTL index (`BOOKING_EXPIRE_AT = STRIPE_SESSION_EXPIRE_AT + 600 s`). The payment may still have succeeded — money received with no booking record.
- No handling of asynchronous payment methods (SEPA, bank debits, anything that confirms after the redirect).
- No `payment_intent.payment_failed` notification path.
- No `charge.dispute.created` handling — disputes happen silently in Stripe.
- No `charge.refunded` reconciliation — if an admin issues a refund through the Stripe Dashboard, the booking row in Mongo is not updated.
- No replay / reconciliation tooling.

**Idempotency:** because there is no webhook, there is no event-ID dedup table. The `checkCheckoutSession` handler could be called multiple times by the frontend, but it is idempotent by accident: on the 2nd call the booking is already `Paid` so the `payment_status === 'paid'` branch runs again and re-sends the confirmation emails (probably double-emails the agency). Not catastrophic but not robust.

**Signature verification:** N/A — no webhook to verify.

---

## 6. Refund flow — **does not exist**

`grep -rin 'refund' backend/src/` returns zero hits.

Cancellation flow (`cancelBooking` at `bookingController.ts:936`) does the following:
```ts
if (booking && booking.cancellation && !booking.cancelRequest) {
  booking.cancelRequest = true
  await booking.save()
  // notify agency, notify admin
  res.sendStatus(200)
}
```
That's it. It just flips a `cancelRequest: true` flag on the booking and emails the agency. No Stripe refund is initiated, no money moves. The agency presumably handles the refund manually outside the system.

Compare to lctnships: atomic Stripe `refunds.create({ payment_intent, refund_application_fee: true })` first, then DB update, then renter / host emails. Movinin has none of that.

---

## 7. PayPal parallel

PayPal is implemented as a **mirror structure** of Stripe but using the PayPal REST API directly (no SDK):

| Concept | Stripe | PayPal |
|---|---|---|
| Singleton | `payment/stripe.ts` | `payment/paypal.ts` (manual `axios` calls to `api-m.paypal.com`) |
| Create order | `stripeController.createCheckoutSession` | `paypalController.createPayPalOrder` |
| Verify order | `stripeController.checkCheckoutSession` | `paypalController.checkPayPalOrder` |
| Booking field | `sessionId`, `paymentIntentId` | `paypalOrderId` |
| Verify status check | `session.payment_status === 'paid'` | `order.status === 'COMPLETED'` |
| Post-success | identical: clear `expireAt`, set `BookingStatus.Paid`, notify renter/agency/admin | identical |
| On failure | `await booking.deleteOne()` | `await booking.deleteOne()` |

The two controllers share the same notify / confirm helpers from `bookingController`. Frontend selects between them via `env.PAYMENT_GATEWAY` (`'stripe' | 'payPal'`) at build time — they are not used together. PayPal also has **no webhook**, **no platform-fee split**, **no refund flow** — same gaps as Stripe.

PayPal does pass `countryCode` (resolved from request IP via `ipinfoHelper`) into `createOrder`, which Stripe's path doesn't bother with. That's the one extra wrinkle.

---

## 8. Customer ID storage

- **Renter side:** when a checkout / payment intent is created, `stripeController` runs `customers.list({ email })`. If hit → reuse, if miss → `customers.create()`. The returned `customer.id` is then:
  - returned to the frontend as `PaymentResult.customerId`,
  - persisted on the `Booking.customerId` field,
  - persisted on the `User.customerId` field (`bookingController.ts:255`).
- **Reuse:** every subsequent booking by the same email re-runs `customers.list({ email })` and reuses the existing customer. The DB-stored `User.customerId` is *not* used as a lookup key — the email round-trip to Stripe is the source of truth, which is wasteful (one extra Stripe round-trip per checkout) but correct.
- **No PaymentMethod attach / detach.** No saved cards. Each checkout uses a fresh entry from Stripe's hosted UI.
- **Agency side:** there is no agency-Stripe-anything. Agencies are just Mongo `User` docs with `type: 'agency'`. Agencies have no `stripeAccountId`, no `payouts_enabled`, no Connect record.

---

## 9. Gap analysis vs lctnships

| Feature | lctnships | Movinin |
|---|---|---|
| **Stripe Connect** | Yes — host onboarding via `/api/stripe/connect`, atomic upsert against unique `stripe_account_id`, `charges_enabled` verified before checkout | No — single-tenant Stripe account |
| **Platform fee** | Yes — `PLATFORM_FEE_PERCENT = 15`, applied via `payment_intent_data.transfer_data.destination` + `application_fee_amount` (85/15 split, single charge) | No — every cent goes to platform |
| **Automatic host payouts** | Yes — Stripe handles transfer to host's Connect account on every successful charge | No — operator manually wires money to agencies |
| **Webhook handler** | Yes — `/api/stripe/webhook`, signature-verified via `constructEvent`, raw-body, Node runtime pin | **None** — client-side polling only |
| **Webhook idempotency** | Yes — `processed_webhook_events` table, unique-insert short-circuit on retry | **None** — no event store |
| **Events handled** | `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `transfer.created`, `payout.failed`, `charge.dispute.created` | **None** |
| **Refund flow** | Atomic: Stripe `refunds.create({ refund_application_fee: true })` → DB update → emails. `requires_manual_payout_reversal` flag if payout already went out | **None** — cancellation is just a `cancelRequest: true` flag |
| **Server-side price recalc** | Yes — `/api/bookings POST` re-computes from `studios.price_per_hour` / `booking_blocks` and rejects > 2% drift; checkout routes overwrite financial fields via admin client | Trusts client-supplied `amount` straight from `req.body.amount`. **No server-side validation against the property's price.** |
| **`charges_enabled` precheck** | Yes — refuses to build `transfer_data` for an unverified host | N/A (no Connect) |
| **Disputes / payout-failed alerting** | Yes — flags `requires_manual_payout_reversal`, updates payout status | None |
| **Customer Portal** | Not used by lctnships either, but Connect Express dashboards are available to hosts | None |
| **Idempotency on outbound calls** | Yes — `idempotencyKey` on payouts that does NOT include `Date.now()` | No |
| **Open-redirect protection on return URL** | Yes — `validateRedirectPath()` | N/A — return URL is hardcoded server-side, so safe by construction here |
| **PayPal as fallback** | No | Yes — full mirror of the Stripe flow (with same gaps) |

### Bottom line
lctnships' Stripe layer is a **proper marketplace integration** (Connect + platform fee + webhook + idempotency + refund + dispute handling). Movinin's Stripe layer is a **single-tenant card-processing wrapper with a client-poll instead of a webhook**, and the agency-side payout problem is punted entirely outside the system.

For any Lctnships → Movinin code re-use:
- The stripe controller skeleton (Customer reuse + Checkout Session create) is fine to copy.
- Everything else (Connect onboarding, fee math, webhook + idempotency, refund flow, dispute handling) needs to be ported from lctnships, **not** from Movinin — Movinin simply doesn't have it.

---

## Key file paths (absolute)

- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/payment/stripe.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/controllers/stripeController.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/routes/stripeRoutes.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/controllers/bookingController.ts` (lines 207–227 PI verify, 936–977 cancel)
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/controllers/paypalController.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/payment/paypal.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/models/Booking.ts` (lines 63–84)
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/models/User.ts` (line 99)
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/config/env.config.ts` (lines 342–383)
- `/Users/rivaldomacandrew/Desktop/movinin/frontend/src/services/StripeService.ts`
- `/Users/rivaldomacandrew/Desktop/movinin/frontend/src/pages/Checkout.tsx`
- `/Users/rivaldomacandrew/Desktop/movinin/frontend/src/pages/CheckoutSession.tsx`
- `/Users/rivaldomacandrew/Desktop/movinin/packages/movinin-types/index.ts` (line 52 `PaymentGateway` enum)
