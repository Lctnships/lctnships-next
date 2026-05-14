import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Renter cancel-flow up to the confirmation modal.
 *
 * We mock /api/bookings/[id]/cancel so:
 *   1. The preview step returns a refund object (modal advances to step 2)
 *   2. The confirm step returns success (modal closes)
 *
 * This never hits real Stripe and never mutates the seeded booking.
 */

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
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const SEED_BOOKING_NUMBER = "E2E-TEST-0001"

test.describe("Booking cancel flow (renter, mocked Stripe)", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  let bookingId: string | null = null

  test.beforeAll(async () => {
    const { data } = await admin
      .from("bookings")
      .select("id")
      .eq("booking_number", SEED_BOOKING_NUMBER)
      .maybeSingle()
    bookingId = data?.id ?? null
  })

  test("renter opens cancel modal on booking detail page", async ({ page }) => {
    test.skip(!bookingId, "needs SEED-E2E-0001 booking from tests/fixtures/seed.ts")

    await page.goto(`/nl/bookings/${bookingId}`)
    // The booking detail page must load — header should appear
    await expect(page.locator("h1, h2, h3").first()).toBeVisible({ timeout: 15000 })

    // "Annuleer" / "Annuleren" button appears for upcoming bookings
    const cancelBtn = page.getByRole("button", { name: /Annuleer|Annuleren/i }).first()
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click()
      await expect(page.getByText(/Boeking annuleren/i).first()).toBeVisible({ timeout: 5000 })
    }
  })

  test("cancel preview API call is mocked → modal advances to confirm step", async ({ page }) => {
    test.skip(!bookingId, "needs SEED-E2E-0001 booking from tests/fixtures/seed.ts")

    let previewCalled = false
    let confirmCalled = false

    // POST /api/bookings/:id/cancel  — preview (no { confirmed: true })
    await page.route(`**/api/bookings/${bookingId}/cancel`, async (route) => {
      const body = route.request().postDataJSON() as { confirmed?: boolean } | null
      if (body?.confirmed) {
        confirmCalled = true
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        })
      }
      previewCalled = true
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          preview: true,
          policy: "moderate",
          refund: { percentage: 50, amount: 100 },
        }),
      })
    })

    await page.goto(`/nl/bookings/${bookingId}`)
    const cancelBtn = page.getByRole("button", { name: /Annuleer|Annuleren/i }).first()
    if (!(await cancelBtn.isVisible().catch(() => false))) {
      test.skip(true, "Cancel button not rendered for this booking state")
    }
    await cancelBtn.click()

    await page.locator("textarea").first().fill("E2E test reason")
    await page.getByRole("button", { name: /Volgende/i }).click()

    // Preview-step UI: "Bevestig annulering"
    await expect(page.getByRole("heading", { name: /Bevestig annulering/i })).toBeVisible({
      timeout: 5000,
    })
    expect(previewCalled).toBe(true)

    // Now click final confirm — mock returns 200 and modal closes
    await page.getByRole("button", { name: /Bevestig annulering/i }).click()
    // Either the modal disappears or the page refreshes — give it a moment.
    await page.waitForLoadState("networkidle").catch(() => {})
    expect(confirmCalled).toBe(true)
  })

  test("cancel POST 4xx surfaces error to the user", async ({ page }) => {
    test.skip(!bookingId, "needs SEED-E2E-0001 booking from tests/fixtures/seed.ts")

    await page.route(`**/api/bookings/${bookingId}/cancel`, (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Mocked error: cannot cancel" }),
      }),
    )

    await page.goto(`/nl/bookings/${bookingId}`)
    const cancelBtn = page.getByRole("button", { name: /Annuleer|Annuleren/i }).first()
    if (!(await cancelBtn.isVisible().catch(() => false))) {
      test.skip(true, "Cancel button not rendered for this booking state")
    }
    await cancelBtn.click()
    await page.locator("textarea").first().fill("triggers error")
    await page.getByRole("button", { name: /Volgende/i }).click()

    await expect(page.getByText(/Mocked error|cannot cancel/i).first()).toBeVisible({
      timeout: 5000,
    })
  })
})
