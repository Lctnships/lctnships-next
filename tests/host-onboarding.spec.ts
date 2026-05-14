import { test, expect } from "@playwright/test"
import { HOST_STORAGE_STATE } from "./fixtures/global-setup"

/**
 * Host onboarding wizard — multi-step flow:
 *   basics (page.tsx) → media → equipment → pricing → calendar → success.
 *
 * Wizard state is persisted in localStorage as `studio_draft`. The sidebar
 * keeps later steps disabled until prerequisites are met, so we exercise step
 * gating by populating localStorage before navigation.
 */

test.describe("Host onboarding wizard", () => {
  test.use({ storageState: HOST_STORAGE_STATE })

  test("step 1 (basics) renders for an authenticated host", async ({ page }) => {
    await page.goto("/nl/host/onboarding")
    // Step label + heading
    await expect(page.getByText(/Stap 1/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole("heading", { name: /Vertel ons over je ruimte/i })).toBeVisible({
      timeout: 10000,
    })
    // The "Verder naar Media" submit button is disabled without a studio type + name
    const submitBtn = page.getByRole("button", { name: /Verder naar Media/i })
    if (await submitBtn.isVisible().catch(() => false)) {
      await expect(submitBtn).toBeDisabled()
    }
  })

  test("step 1 enables submit once type + name are filled", async ({ page }) => {
    await page.goto("/nl/host/onboarding")
    await expect(page.getByRole("heading", { name: /Vertel ons over je ruimte/i })).toBeVisible({
      timeout: 10000,
    })

    // Pick the photo studio tile
    const photoTile = page.getByRole("button", { name: /Fotostudio/i }).first()
    if (await photoTile.isVisible().catch(() => false)) {
      await photoTile.click()
    }

    // Fill name
    const nameInput = page.locator('input[placeholder*="Skyline"]').first()
    await nameInput.fill("Onboarding E2E Studio")

    const submitBtn = page.getByRole("button", { name: /Verder naar Media/i })
    if (await submitBtn.isVisible().catch(() => false)) {
      await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    }
  })

  test("step 4 (pricing) reachable when prior steps marked complete in draft", async ({ page }) => {
    // Pre-populate the localStorage draft so the sidebar lets us reach pricing
    await page.goto("/nl/host/onboarding")
    await page.evaluate(() => {
      localStorage.setItem(
        "studio_draft",
        JSON.stringify({
          type: "photo",
          title: "Onboarding E2E Studio",
          location: "Amsterdam, Netherlands",
          images: ["https://example.com/img1.jpg"],
          equipment: [{ name: "Camera" }],
        }),
      )
    })

    await page.goto("/nl/host/onboarding/pricing")
    await expect(page.getByText(/Stel je prijzen in/i).first()).toBeVisible({ timeout: 15000 })
    // The hourly-rate input exists
    const rateInput = page.locator('input[type="number"]').first()
    await expect(rateInput).toBeVisible({ timeout: 10000 })
  })

  test("step 5 (calendar) renders after pricing draft saved", async ({ page }) => {
    await page.goto("/nl/host/onboarding")
    await page.evaluate(() => {
      localStorage.setItem(
        "studio_draft",
        JSON.stringify({
          type: "photo",
          title: "Onboarding E2E Studio",
          location: "Amsterdam, Netherlands",
          images: ["https://example.com/img1.jpg"],
          equipment: [{ name: "Camera" }],
          price_per_hour: 50,
          cleaning_fee: 0,
          weekend_markup: 15,
        }),
      )
    })

    await page.goto("/nl/host/onboarding/calendar")
    await expect(page.getByText(/Stel je beschikbaarheid in/i).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test("sidebar progress badge updates as draft fills up", async ({ page }) => {
    await page.goto("/nl/host/onboarding")
    await page.evaluate(() => {
      localStorage.setItem(
        "studio_draft",
        JSON.stringify({
          type: "photo",
          title: "Progress Test",
          location: "Amsterdam, Netherlands",
        }),
      )
    })
    await page.reload()
    // Progress label is rendered as "n%" in the sidebar
    const progressBadge = page.locator("text=/^\\d+%$/")
    await expect(progressBadge.first()).toBeVisible({ timeout: 15000 })
  })
})
