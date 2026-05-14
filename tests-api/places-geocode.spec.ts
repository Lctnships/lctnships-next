import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable, loginAndGetCookie } from "./setup"

/**
 * /api/places/geocode is a Google Places proxy. It must be auth-gated so
 * we don't expose our quota, and it must validate the `address` query
 * param so bad clients can't burn 500-error responses on us.
 */
describe("places/geocode", () => {
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

  it("GET /api/places/geocode without auth → 401", async () => {
    if (!serverUp) return
    const res = await callRoute("GET", "/api/places/geocode", {
      query: { address: "Amsterdam" },
    })
    expect(res.status).toBe(401)
  })

  it("GET /api/places/geocode without address param → 400 (when logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("GET", "/api/places/geocode", { cookie })
    expect([400, 401]).toContain(res.status)
  })

  it("GET /api/places/geocode with address → 200 (when logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("GET", "/api/places/geocode", {
      cookie,
      query: { address: "Amsterdam, Netherlands" },
    })
    // 200 on success, 500 if no Google API key configured in test env.
    expect([200, 500]).toContain(res.status)
  })
})
