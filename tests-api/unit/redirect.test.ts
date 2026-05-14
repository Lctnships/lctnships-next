import { describe, it, expect } from "vitest"
import { validateRedirectPath } from "@/lib/redirect"

/**
 * Unit tests for the open-redirect validator used by:
 *   - src/app/api/auth/callback/route.ts (OAuth flow)
 *   - src/components/auth/login-form.tsx (email/password flow)
 *
 * Anything that doesn't start with a single `/` (and is not `//`) must
 * fall back to `/dashboard`. Schemes like `javascript:` and `data:` must
 * also be rejected — even when buried inside an otherwise valid-looking
 * path — because some Next routes splice the value into HTML.
 */
describe("validateRedirectPath", () => {
  it("accepts a simple internal path", () => {
    expect(validateRedirectPath("/dashboard")).toBe("/dashboard")
    expect(validateRedirectPath("/host/bookings/123")).toBe("/host/bookings/123")
  })

  it("rejects absolute URLs", () => {
    expect(validateRedirectPath("https://evil.com")).toBe("/dashboard")
    expect(validateRedirectPath("http://evil.com/path")).toBe("/dashboard")
  })

  it("rejects protocol-relative URLs", () => {
    expect(validateRedirectPath("//evil.com")).toBe("/dashboard")
    expect(validateRedirectPath("//evil.com/path")).toBe("/dashboard")
  })

  it("rejects empty / null / undefined", () => {
    expect(validateRedirectPath("")).toBe("/dashboard")
    expect(validateRedirectPath(null)).toBe("/dashboard")
    expect(validateRedirectPath(undefined)).toBe("/dashboard")
  })

  it("rejects javascript: and data: schemes", () => {
    expect(validateRedirectPath("javascript:alert(1)")).toBe("/dashboard")
    expect(validateRedirectPath("/path?next=javascript:alert(1)")).toBe(
      "/dashboard",
    )
    expect(validateRedirectPath("data:text/html,<script>x</script>")).toBe(
      "/dashboard",
    )
  })

  it("rejects paths without leading slash", () => {
    expect(validateRedirectPath("dashboard")).toBe("/dashboard")
    expect(validateRedirectPath("evil.com")).toBe("/dashboard")
  })
})
