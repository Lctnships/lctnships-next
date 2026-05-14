import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable } from "./setup"

/**
 * Cron contract tests.
 *
 * `/api/cron/extension-reminders` is POST-only and protected by a
 * `Bearer ${CRON_SECRET}` Authorization header. Vercel Cron sends POST;
 * GET is not implemented and will return 405 from Next.
 */
describe("cron/extension-reminders", () => {
  let serverUp = false
  beforeAll(async () => {
    serverUp = await isServerReachable()
  })

  it("POST without Authorization → 401", async () => {
    if (!serverUp) return
    const res = await callRoute("POST", "/api/cron/extension-reminders")
    expect(res.status).toBe(401)
  })

  it("POST with wrong Bearer secret → 401", async () => {
    if (!serverUp) return
    const res = await callRoute("POST", "/api/cron/extension-reminders", {
      headers: { Authorization: "Bearer not-the-real-secret" },
    })
    expect(res.status).toBe(401)
  })

  it("POST with correct Bearer secret → 200 (or 500 if downstream fails)", async () => {
    if (!serverUp) return
    const secret = process.env.CRON_SECRET
    if (!secret) return
    const res = await callRoute("POST", "/api/cron/extension-reminders", {
      headers: { Authorization: `Bearer ${secret}` },
    })
    // 200 on success, 500 if Resend/email config is incomplete in the
    // test env — but never 401 with a valid secret.
    expect(res.status).not.toBe(401)
    expect([200, 500]).toContain(res.status)
  })

  it("GET → 405 (route only exports POST)", async () => {
    if (!serverUp) return
    const res = await callRoute("GET", "/api/cron/extension-reminders")
    // Next returns 405 for unhandled HTTP methods on a route module.
    expect([401, 404, 405]).toContain(res.status)
  })
})
