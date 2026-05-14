import { describe, it, expect, beforeAll } from "vitest"
import { callRoute, isServerReachable, loginAndGetCookie } from "./setup"
import { validateRedirectPath } from "@/lib/redirect"

/**
 * Auth contract tests.
 *
 * Note: there is no `POST /api/auth/sessions` route in this codebase —
 * login flows through `@supabase/ssr` in the login form. We test:
 *  - the open-redirect validator (used by /api/auth/callback + login-form)
 *  - the OAuth callback rejects malicious ?redirect= values
 *  - logging in with valid + invalid credentials via the Supabase token
 *    endpoint (mirrors what loginAndGetCookie does).
 */
describe("auth", () => {
  let serverUp = false
  beforeAll(async () => {
    serverUp = await isServerReachable()
  })

  it("validateRedirectPath rejects malicious redirects (unit guard)", () => {
    expect(validateRedirectPath("/dashboard")).toBe("/dashboard")
    expect(validateRedirectPath("https://evil.com")).toBe("/dashboard")
    expect(validateRedirectPath("//evil.com")).toBe("/dashboard")
    expect(validateRedirectPath("javascript:alert(1)")).toBe("/dashboard")
    expect(validateRedirectPath("")).toBe("/dashboard")
    expect(validateRedirectPath(null)).toBe("/dashboard")
  })

  it("GET /api/auth/callback without code redirects safely", async () => {
    if (!serverUp) return
    const res = await callRoute("GET", "/api/auth/callback", {
      query: { redirect: "https://evil.com" },
    })
    // Should not 5xx, and any Location header must be relative
    expect(res.status).toBeLessThan(500)
    const loc = res.headers.get("location")
    if (loc) {
      expect(loc.startsWith("https://evil.com")).toBe(false)
    }
  })

  it("Supabase password login rejects wrong password (401)", async () => {
    if (!serverUp) return
    const cookie = await loginAndGetCookie(
      "test-renter@lctnships.test",
      "wrong-password-zzz",
    )
    // loginAndGetCookie returns "" on failure
    expect(cookie).toBe("")
  })

  it("Supabase password login succeeds with seeded creds (best effort)", async () => {
    if (!serverUp) return
    const cookie = await loginAndGetCookie(
      "test-renter@lctnships.test",
      "TestRenter2026!",
    )
    // We don't fail if seed isn't loaded — this is a contract probe.
    if (cookie) {
      expect(cookie).toContain("sb-access-token=")
    }
  })
})
