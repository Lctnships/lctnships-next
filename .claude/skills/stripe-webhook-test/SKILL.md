---
name: stripe-webhook-test
description: Start Stripe CLI webhook forwarding to local dev server and trigger common marketplace events (checkout, payout, connect account updates)
disable-model-invocation: true
---

# Stripe Webhook Test

Local testing helper for `/api/stripe/webhook`.

## Prerequisites
- Stripe CLI installed: `brew install stripe/stripe-cli/stripe`
- Logged in: `stripe login`
- Dev server running on port 3000: `npm run dev`

## Step 1 — Forward webhooks to local

Run in a dedicated terminal and keep it open:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` signing secret it prints and set it in `.env.local` as `STRIPE_WEBHOOK_SECRET` (restart dev server after changing).

## Step 2 — Trigger events

Run from a second terminal. Pick based on the flow you're testing:

### Checkout / booking payment
```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Stripe Connect (hosts)
```bash
stripe trigger account.updated
stripe trigger capability.updated
stripe trigger account.external_account.created
```

### Payouts
```bash
stripe trigger payout.created
stripe trigger payout.paid
stripe trigger payout.failed
```

### Refunds / disputes
```bash
stripe trigger charge.refunded
stripe trigger charge.dispute.created
```

## Step 3 — Replay a real event

```bash
stripe events resume evt_XXXXXXXXXXXX
```

## Troubleshooting

- **400 signature failure**: `STRIPE_WEBHOOK_SECRET` in `.env.local` must match the `whsec_` from `stripe listen` (not the dashboard one).
- **Event received but handler fails**: check `stripe listen` terminal — it prints the response code and body from your route.
- **Raw body parsing**: Next.js App Router needs the raw body for `constructEvent`. Verify `src/app/api/stripe/webhook/route.ts` reads `await req.text()`, not `req.json()`.

## Custom fixture payload

```bash
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.booking_id=<uuid> \
  --override checkout_session:metadata.host_id=<uuid>
```
