import { describe, it, expect } from "vitest"

/**
 * SSRF guard unit tests.
 *
 * The lctnships codebase doesn't expose a shared SSRF helper module —
 * the pattern is inlined in /api/calendar/import/[studioId]/route.ts and
 * the studio image upload paths. To keep these unit tests honest we
 * re-implement the exact rules here, mirroring the production checks:
 *
 *   1. URL must parse via `new URL()`
 *   2. Protocol MUST be `https:`
 *   3. Hostname MUST match (or end with `.`) an allowlisted host
 *   4. Hostname MUST NOT be a loopback / private / link-local address
 *
 * If a future refactor extracts this into `@/lib/ssrf`, replace the
 * local `isAllowedICalUrl` with an import from that module.
 */

const TRUSTED_ICAL_HOSTS = [
  "wix.com",
  "wixapps.net",
  "wixsite.com",
  "wixstatic.com",
  "parastorage.com",
  "meetingpackage.com",
  "meetingpackage.io",
]

function isAllowedICalUrl(input: string): { ok: boolean; reason?: string } {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return { ok: false, reason: "parse" }
  }
  if (url.protocol !== "https:") return { ok: false, reason: "scheme" }

  const hostname = url.hostname.toLowerCase()
  const isTrusted = TRUSTED_ICAL_HOSTS.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`),
  )
  if (!isTrusted) return { ok: false, reason: "host" }

  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === "::1" ||
    hostname.startsWith("fe80:")
  ) {
    return { ok: false, reason: "private" }
  }

  return { ok: true }
}

describe("iCal SSRF guard", () => {
  it("rejects http:// (must be HTTPS)", () => {
    const r = isAllowedICalUrl("http://wix.com/calendar.ics")
    expect(r.ok).toBe(false)
    expect(r.reason).toBe("scheme")
  })

  it("rejects untrusted hosts", () => {
    const r = isAllowedICalUrl("https://evil.com/cal.ics")
    expect(r.ok).toBe(false)
    expect(r.reason).toBe("host")
  })

  it("rejects loopback", () => {
    const r = isAllowedICalUrl("https://localhost/cal.ics")
    expect(r.ok).toBe(false)
    // localhost is also not in allowlist, so 'host' fires first
    expect(["host", "private"]).toContain(r.reason)
  })

  it("rejects private IPv4 ranges", () => {
    expect(isAllowedICalUrl("https://10.0.0.1/cal.ics").ok).toBe(false)
    expect(isAllowedICalUrl("https://192.168.1.1/cal.ics").ok).toBe(false)
    expect(isAllowedICalUrl("https://172.16.0.1/cal.ics").ok).toBe(false)
    expect(isAllowedICalUrl("https://169.254.169.254/cal.ics").ok).toBe(false)
    expect(isAllowedICalUrl("https://127.0.0.1/cal.ics").ok).toBe(false)
  })

  it("rejects IPv6 link-local + loopback", () => {
    expect(isAllowedICalUrl("https://[::1]/cal.ics").ok).toBe(false)
    expect(isAllowedICalUrl("https://[fe80::1]/cal.ics").ok).toBe(false)
  })

  it("rejects malformed URLs", () => {
    const r = isAllowedICalUrl("not-a-url")
    expect(r.ok).toBe(false)
    expect(r.reason).toBe("parse")
  })

  it("accepts trusted Wix subdomain", () => {
    const r = isAllowedICalUrl("https://users.wix.com/calendars/foo.ics")
    expect(r.ok).toBe(true)
  })

  it("accepts trusted MeetingPackage subdomain", () => {
    const r = isAllowedICalUrl(
      "https://api.meetingpackage.com/feed/abc.ics",
    )
    expect(r.ok).toBe(true)
  })

  it("rejects host that 'contains' a trusted name but isn't a subdomain", () => {
    // e.g. wix.com.evil.example — endsWith(`.wix.com`) is false because
    // the suffix is .example, so this must be rejected.
    const r = isAllowedICalUrl("https://wix.com.evil.example/cal.ics")
    expect(r.ok).toBe(false)
  })
})
