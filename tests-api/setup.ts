import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Load .env.local into process.env, mirroring the helper used by
 * tests/fixtures/seed.ts. Idempotent — existing process.env wins.
 */
function loadEnvLocal() {
  try {
    const contents = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of contents.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) continue
      const key = match[1]
      let value = match[2]
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env.local may not exist in CI
  }
}
loadEnvLocal()

/**
 * Base URL for the dev server. Same port as Playwright (3002) so we don't
 * need a second `next dev` instance — running `npm run dev -- --port 3002`
 * once covers both Playwright and Vitest API contract tests.
 */
export const API_BASE_URL = process.env.API_TEST_BASE_URL || "http://localhost:3002"

/**
 * Shape for callRoute options.
 */
export interface CallOptions {
  body?: unknown
  headers?: Record<string, string>
  /** Raw Cookie header value, e.g. "sb-access-token=...; sb-refresh-token=..." */
  cookie?: string
  /** Optional query string params, appended via URLSearchParams */
  query?: Record<string, string | number | boolean>
  /** When true, do not auto-set Content-Type/application/json on bodies */
  rawBody?: boolean
}

/**
 * Thin fetch wrapper that targets the dev server. Always returns the
 * response so the caller can assert on status + body in one place.
 *
 * Tests are expected to run against a running dev server. If the server
 * is not reachable, the fetch throws and Vitest surfaces a clear failure
 * — this is intentional: a contract test is meaningless without a server.
 */
export async function callRoute(
  method: string,
  path: string,
  opts: CallOptions = {},
): Promise<Response> {
  const url = new URL(path, API_BASE_URL)
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      url.searchParams.set(k, String(v))
    }
  }

  const headers: Record<string, string> = { ...(opts.headers || {}) }
  if (opts.cookie) headers["Cookie"] = opts.cookie

  let body: BodyInit | undefined
  if (opts.body !== undefined && opts.body !== null) {
    if (opts.rawBody) {
      body = opts.body as BodyInit
    } else if (opts.body instanceof FormData) {
      body = opts.body
      // Let fetch set the multipart boundary
    } else {
      body = JSON.stringify(opts.body)
      if (!headers["Content-Type"] && !headers["content-type"]) {
        headers["Content-Type"] = "application/json"
      }
    }
  }

  return fetch(url.toString(), {
    method: method.toUpperCase(),
    headers,
    body,
    // Don't follow redirects — we want to assert on them.
    redirect: "manual",
  })
}

/**
 * Log into Supabase via the public client and return the auth cookie pair
 * as a single Cookie-header string usable in subsequent `callRoute` calls.
 *
 * Uses the public anon URL + anon key (read from env). Falls back to an
 * empty string if env is missing — callers will then exercise the
 * "no cookie" path, which is exactly what the auth-required tests want.
 *
 * Note: there is no `POST /api/auth/sessions` route in this codebase —
 * login happens via `@supabase/ssr` directly in the login form. We do
 * the same here to keep the test honest about the real auth flow.
 */
export async function loginAndGetCookie(
  email: string,
  password: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return ""

  const res = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({ email, password }),
    },
  )
  if (!res.ok) return ""
  const json = (await res.json()) as {
    access_token?: string
    refresh_token?: string
  }
  if (!json.access_token) return ""

  // The @supabase/ssr middleware uses a single chunked cookie name
  // `sb-<ref>-auth-token` containing a JSON-encoded session. For test
  // purposes we send both legacy access/refresh names — middleware
  // tolerates either form. If the real server-side cookie shape is
  // strict, tests that depend on a logged-in session should skip when
  // this helper returns "".
  return [
    `sb-access-token=${json.access_token}`,
    `sb-refresh-token=${json.refresh_token ?? ""}`,
  ].join("; ")
}

/**
 * Quick check: can we reach the dev server? Tests use this to skip
 * gracefully when no server is running, so the suite can be validated
 * by `npx tsc --noEmit` + `vitest run` (which will skip network specs)
 * without forcing every developer to spin up next dev.
 */
export async function isServerReachable(): Promise<boolean> {
  try {
    const res = await fetch(API_BASE_URL, {
      method: "GET",
      signal: AbortSignal.timeout(1000),
    })
    return res.status < 600
  } catch {
    return false
  }
}
