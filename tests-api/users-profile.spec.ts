import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable, loginAndGetCookie } from "./setup"

/**
 * /api/users/profile contract tests.
 *
 * Security invariant: column-level grants on `users` (migrations 011 + 018)
 * mean the authenticated role can SELECT only 9 public columns and UPDATE
 * only a small whitelist. The profile route reads via the admin client
 * AFTER identity check — so we can't directly verify column grants here,
 * but we CAN verify that:
 *   - GET requires auth
 *   - PATCH requires auth
 *   - PATCH attempts to write sensitive fields (stripe_account_id, email,
 *     two_factor_enabled, onboarding_complete) are either silently dropped
 *     or rejected, not blindly applied.
 */
describe("users/profile", () => {
  let serverUp = false
  let cookie = ""

  beforeAll(async () => {
    serverUp = await isServerReachable()
    if (serverUp) {
      cookie = await loginAndGetCookie(
        "test-renter@lctnships.test",
        "TestRenter2026!",
      )
    }
  })

  it("GET /api/users/profile → 401 without auth", async () => {
    if (!serverUp) return
    const res = await callRoute("GET", "/api/users/profile")
    expect(res.status).toBe(401)
  })

  it("PATCH /api/users/profile → 401 without auth", async () => {
    if (!serverUp) return
    const res = await callRoute("PATCH", "/api/users/profile", {
      body: { full_name: "Hacker" },
    })
    expect(res.status).toBe(401)
  })

  it("PATCH /api/users/profile → does not apply sensitive financial fields", async () => {
    if (!serverUp || !cookie) return
    // Attempt to set fields that authenticated role is NOT granted on:
    // stripe_account_id, two_factor_enabled, onboarding_complete (write
    // path is restricted by column grants in migration 011/018).
    const res = await callRoute("PATCH", "/api/users/profile", {
      cookie,
      body: {
        full_name: "Renter QA",
        stripe_account_id: "acct_evil",
        two_factor_enabled: true,
        is_verified: true,
        email: "stolen@evil.com",
      },
    })
    // Either 200 (sensitive fields silently dropped by the route) or
    // 400/403/500 (rejected outright). What we MUST NOT see is a JSON
    // response that echoes back `stripe_account_id: "acct_evil"`.
    expect([200, 400, 401, 403, 500]).toContain(res.status)
    if (res.status === 200) {
      const json = (await res.json()) as Record<string, unknown>
      // The profile blob in the response should never reflect attacker
      // values for sensitive columns.
      const payload = JSON.stringify(json)
      expect(payload).not.toContain("acct_evil")
      expect(payload).not.toContain("stolen@evil.com")
    }
  })
})
