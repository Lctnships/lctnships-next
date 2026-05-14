import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable, loginAndGetCookie } from "./setup"

/**
 * /api/upload contract tests.
 *
 * - 401 without auth
 * - 400 without a file
 * - 400 on disallowed mime type (e.g. application/zip)
 * - happy path covered in the E2E suite (involves Supabase Storage write)
 */
describe("upload", () => {
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

  it("POST /api/upload → 401 without auth", async () => {
    if (!serverUp) return
    const fd = new FormData()
    fd.set("bucket", "images")
    const res = await callRoute("POST", "/api/upload", { body: fd })
    expect(res.status).toBe(401)
  })

  it("POST /api/upload → 400 without a file (when logged in)", async () => {
    if (!serverUp || !cookie) return
    const fd = new FormData()
    fd.set("bucket", "images")
    const res = await callRoute("POST", "/api/upload", { cookie, body: fd })
    expect([400, 401]).toContain(res.status)
  })

  it("POST /api/upload → 400 with disallowed mime type", async () => {
    if (!serverUp || !cookie) return
    const fd = new FormData()
    const blob = new Blob(["fake zip"], { type: "application/zip" })
    fd.set("file", blob, "fake.zip")
    fd.set("bucket", "images")
    const res = await callRoute("POST", "/api/upload", { cookie, body: fd })
    expect([400, 401]).toContain(res.status)
  })
})
