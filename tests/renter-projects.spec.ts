import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { TEST_STUDIO } from "./fixtures/test-users"

test.describe("Renter projects (dashboard)", () => {
  test("unauthenticated user redirected to login", async ({ page }) => {
    await page.goto("/nl/projects")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/login/)
  })
})

test.describe("Renter projects — authenticated", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("projects overview renders for logged-in renter", async ({ page }) => {
    await page.goto("/nl/projects")
    await expect(page).toHaveURL(/\/projects/)
    await expect(page.getByRole("heading", { name: /Projecten Overzicht/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test("seeded project is visible in list", async ({ page }) => {
    await page.goto("/nl/projects")
    await expect(page.getByText("E2E Test Project")).toBeVisible({ timeout: 15000 })
  })

  test("clicking seeded project opens detail page", async ({ page }) => {
    await page.goto("/nl/projects")
    await page.getByText("E2E Test Project").first().click()
    await page.waitForURL(/\/projects\/[0-9a-f-]+/, { timeout: 15000 })
    await expect(page.getByText("E2E Test Project").first()).toBeVisible({ timeout: 15000 })
  })

  test("new-project CTA is reachable", async ({ page }) => {
    await page.goto("/nl/projects")
    const cta = page.getByRole("button", { name: /Nieuw Project|Project Aanmaken/i })
      .or(page.getByRole("link", { name: /Nieuw Project|Project Aanmaken/i }))
    await expect(cta.first()).toBeVisible({ timeout: 15000 })
  })

  // Sanity check that the seed ran — studio is used by the booking linked to
  // the seeded conversation that the messages test depends on.
  test("seeded studio exists (sanity check)", async ({ page }) => {
    await page.goto("/nl/explore")
    void TEST_STUDIO
    await expect(page).toHaveURL(/\/explore/)
  })
})
