import { test, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { TOTP } from "otpauth"
import { readFileSync } from "fs"
import { resolve } from "path"
import { TEST_RENTER } from "./fixtures/test-users"

function loadEnv() {
  try {
    const s = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of s.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "")
    }
  } catch {}
}
loadEnv()
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper: clean any existing TOTP factors for the test renter so each run starts clean.
// Supabase JS admin.mfa is unreliable; hit the REST endpoint directly.
async function cleanFactorsFor(email: string, password: string) {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  await anon.auth.signOut().catch(() => {})
  const { data: signin } = await anon.auth.signInWithPassword({ email, password })
  if (!signin?.user) return
  const { data: list } = await anon.auth.mfa.listFactors()
  const factors = list?.all ?? []
  for (const f of factors) {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${signin.user.id}/factors/${f.id}`, {
      method: "DELETE",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }).catch(() => {})
  }
  await admin.from("users").update({ two_factor_enabled: false }).eq("id", signin.user.id)
}

test.describe("Two-factor authentication (TOTP)", () => {
  test.beforeEach(async () => {
    await cleanFactorsFor(TEST_RENTER.email, TEST_RENTER.password)
  })

  test.afterEach(async () => {
    await cleanFactorsFor(TEST_RENTER.email, TEST_RENTER.password)
  })

  test("renter can enroll, then login requires the TOTP code, then can disable", async ({ page }) => {
    // STEP 1 — Login with password (no factor yet, should land on dashboard)
    await page.goto("/nl/login")
    await page.fill("#email", TEST_RENTER.email)
    await page.fill("#password", TEST_RENTER.password)
    await Promise.all([
      page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 }),
      page.click('button[type="submit"]'),
    ])

    // STEP 2 — Open security settings, click "Inschakelen", verify modal opens
    await page.goto("/nl/settings/security")
    await expect(page.getByRole("heading", { name: /Tweefactor|Tweestapsverificatie|Two-factor/i }).first()).toBeVisible({ timeout: 10000 })
    await page.getByRole("button", { name: /Inschakelen/i }).click()
    await expect(page.getByRole("heading", { name: /Tweestapsverificatie inschakelen/i })).toBeVisible()
    await page.getByRole("button", { name: /Doorgaan/i }).click()

    // STEP 3 — Wait for QR + secret display, extract the secret from the page
    await expect(page.getByRole("heading", { name: /Scan deze QR-code/i })).toBeVisible({ timeout: 10000 })
    const secretEl = await page.locator("code").first().textContent()
    expect(secretEl).toBeTruthy()
    const secret = secretEl!.trim()

    // STEP 4 — Generate the current TOTP code using the secret
    const code = new TOTP({ secret, digits: 6, period: 30 }).generate()

    // STEP 5 — Click Volgende → enter code → Activeren
    await page.getByRole("button", { name: /Volgende/i }).click()
    await page.locator('input[inputmode="numeric"]').fill(code)
    await page.getByRole("button", { name: /Activeren/i }).click()

    // Toast success → modal closes → button label flips
    await expect(page.getByRole("button", { name: /Uitschakelen/i })).toBeVisible({ timeout: 10000 })

    // STEP 6 — Logout, login again, expect 2fa-verify redirect
    await page.context().clearCookies()
    await page.goto("/nl/login")
    await page.fill("#email", TEST_RENTER.email)
    await page.fill("#password", TEST_RENTER.password)
    await Promise.all([
      page.waitForURL(/2fa-verify/, { timeout: 20000 }),
      page.click('button[type="submit"]'),
    ])
    expect(page.url()).toMatch(/2fa-verify/)

    // STEP 7 — Generate fresh code, enter, verify lands on dashboard
    const code2 = new TOTP({ secret, digits: 6, period: 30 }).generate()
    await page.locator('input[inputmode="numeric"]').fill(code2)
    await Promise.all([
      page.waitForURL((url) => !url.pathname.includes("2fa-verify"), { timeout: 20000 }),
      page.getByRole("button", { name: /Inloggen/i }).click(),
    ])
    expect(page.url()).not.toMatch(/2fa-verify/)
    expect(page.url()).not.toMatch(/login/)
  })
})
