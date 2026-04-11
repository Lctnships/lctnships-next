/**
 * Validate a redirect path to prevent open redirect attacks.
 *
 * Only permits internal paths. An attacker who controls a login URL cannot
 * bounce the victim to an external origin after a successful auth.
 *
 * Used by:
 *   - src/app/api/auth/callback/route.ts (OAuth flow)
 *   - src/components/auth/login-form.tsx (email/password flow)
 *   - any other place that reads ?redirect= from a URL
 */
export function validateRedirectPath(input: string | null | undefined): string {
  if (!input) return "/dashboard"
  // Must start with a single / (not a protocol-relative //evil.com)
  if (!input.startsWith("/")) return "/dashboard"
  if (input.startsWith("//")) return "/dashboard"
  // Block absolute URLs with schemes
  if (input.includes("://")) return "/dashboard"
  // Block javascript: and data: schemes regardless of position
  const lower = input.toLowerCase()
  if (lower.includes("javascript:") || lower.includes("data:")) return "/dashboard"
  return input
}
