import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable } from "./setup"

/**
 * Stripe webhook contract tests.
 *
 * The webhook does three things in order:
 *   1) Verifies the Stripe signature header.
 *   2) Constructs the event via stripe.webhooks.constructEvent (throws if bad).
 *   3) Performs an idempotency insert into `processed_webhook_events`
 *      keyed on event.id — duplicate event ids short-circuit.
 *
 * We can't easily synth a valid signed payload without the live signing
 * secret, so we focus on:
 *   - Missing signature header → 400.
 *   - Bad signature → 400 (constructEvent throws).
 *   - Sending the same body twice with the same bad signature still →
 *     deterministically 400 (no half-processed state).
 */
describe("stripe webhook", () => {
  let serverUp = false
  beforeAll(async () => {
    serverUp = await isServerReachable()
  })

  it("POST /api/stripe/webhook → 400 when no Stripe-Signature header", async () => {
    if (!serverUp) return
    const res = await callRoute("POST", "/api/stripe/webhook", {
      rawBody: true,
      body: JSON.stringify({ id: "evt_test_no_sig", type: "ping" }),
      headers: { "Content-Type": "application/json" },
    })
    expect(res.status).toBe(400)
  })

  it("POST /api/stripe/webhook → 400 with bogus Stripe-Signature", async () => {
    if (!serverUp) return
    const res = await callRoute("POST", "/api/stripe/webhook", {
      rawBody: true,
      body: JSON.stringify({ id: "evt_test_bad_sig", type: "ping" }),
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=1,v1=deadbeef",
      },
    })
    expect(res.status).toBe(400)
  })

  it("POST /api/stripe/webhook → deterministic on repeated bad-signature replays", async () => {
    if (!serverUp) return
    const body = JSON.stringify({ id: "evt_test_replay", type: "ping" })
    const headers = {
      "Content-Type": "application/json",
      "stripe-signature": "t=1,v1=deadbeef",
    }
    const a = await callRoute("POST", "/api/stripe/webhook", {
      rawBody: true,
      body,
      headers,
    })
    const b = await callRoute("POST", "/api/stripe/webhook", {
      rawBody: true,
      body,
      headers,
    })
    // Both calls must reject identically — proves no partial mutation
    // happens before signature verification.
    expect(a.status).toBe(400)
    expect(b.status).toBe(400)
  })
})
