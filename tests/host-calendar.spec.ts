import { test, expect } from "@playwright/test"
import { HOST_STORAGE_STATE } from "./fixtures/global-setup"

test.describe("Host calendar (CRM agenda)", () => {
  test("unauthenticated NL user is redirected to login", async ({ page }) => {
    await page.goto("/nl/host/calendar")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("unauthenticated EN user is redirected to login", async ({ page }) => {
    await page.goto("/en/host/calendar")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/login/)
  })

  test("calendar route responds without 5xx", async ({ page }) => {
    const response = await page.goto("/nl/host/calendar")
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe("Host calendar — authenticated", () => {
  test.use({ storageState: HOST_STORAGE_STATE })

  test("calendar page renders for logged-in host", async ({ page }) => {
    await page.goto("/nl/host/calendar")
    await expect(page).toHaveURL(/\/host\/calendar/)
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/geplande producties deze maand/i)).toBeVisible({ timeout: 10000 })
  })

  test("shows seeded booking entry somewhere on the page", async ({ page }) => {
    await page.goto("/nl/host/calendar")
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/geplande producties/i)).toContainText(/[1-9]/, {
      timeout: 10000,
    })
  })

  test("today button is visible", async ({ page }) => {
    await page.goto("/nl/host/calendar")
    await expect(page.getByRole("button", { name: /vandaag/i })).toBeVisible({ timeout: 15000 })
  })
})
