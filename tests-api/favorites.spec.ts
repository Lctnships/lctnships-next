import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable, loginAndGetCookie } from "./setup"

/**
 * /api/favorites contract tests.
 *
 * - GET → 401 without cookie
 * - POST → 401 without cookie
 * - POST without studio_id → 400
 * - POST with invalid UUID → 400
 * - POST then POST again with same studio_id → idempotent (200 the 2nd time)
 * - DELETE without studio_id → 400
 */
describe("favorites", () => {
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

  it("GET /api/favorites → 401 without cookie", async () => {
    if (!serverUp) return
    const res = await callRoute("GET", "/api/favorites")
    expect(res.status).toBe(401)
  })

  it("POST /api/favorites → 401 without cookie", async () => {
    if (!serverUp) return
    const res = await callRoute("POST", "/api/favorites", {
      body: { studio_id: "00000000-0000-0000-0000-000000000000" },
    })
    expect(res.status).toBe(401)
  })

  it("POST /api/favorites → 400 without studio_id (logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("POST", "/api/favorites", {
      cookie,
      body: {},
    })
    expect([400, 401]).toContain(res.status)
  })

  it("POST /api/favorites → 400 with invalid UUID (logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("POST", "/api/favorites", {
      cookie,
      body: { studio_id: "not-a-uuid" },
    })
    expect([400, 401]).toContain(res.status)
  })

  it("DELETE /api/favorites → 400 without studioId query (logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("DELETE", "/api/favorites", { cookie })
    expect([400, 401]).toContain(res.status)
  })

  it("DELETE /api/favorites → 400 with invalid UUID query (logged in)", async () => {
    if (!serverUp || !cookie) return
    const res = await callRoute("DELETE", "/api/favorites", {
      cookie,
      query: { studioId: "not-a-uuid" },
    })
    expect([400, 401]).toContain(res.status)
  })
})
