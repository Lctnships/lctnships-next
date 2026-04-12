import { test, expect } from "@playwright/test"

test.describe("Smoke tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/nl")
    await expect(page).toHaveTitle(/lctnships/)
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 })
  })

  test("become-host page loads with correct Calendly link", async ({ page }) => {
    await page.goto("/nl/become-host")
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 })
    const calendlyLink = page.locator('a[href*="calendly"]').first()
    await expect(calendlyLink).toHaveAttribute("href", "https://calendly.com/rivaldorose/30min")
  })

  test("navigation works", async ({ page }) => {
    await page.goto("/nl")
    await expect(page.getByRole("link", { name: "lctnships" }).first()).toBeVisible()
  })

  test("explore page loads", async ({ page }) => {
    await page.goto("/nl/explore")
    await expect(page).toHaveTitle(/lctnships/)
  })

  test("images load without errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/nl")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(2000)

    const heroImg = page.locator("img").first()
    await expect(heroImg).toBeVisible()

    expect(errors.filter((e) => e.includes("image"))).toHaveLength(0)
  })
})
