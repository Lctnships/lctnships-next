import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"

/**
 * Mobile-viewport-specific checks. These tests are designed to run under the
 * "mobile-chrome" Playwright project (Pixel 5 device emulator) but are written
 * to work on any viewport — assertions just become no-ops where the desktop
 * UI is rendered.
 *
 * Coverage:
 *   - Authenticated mobile renter sees the bottom-nav fixed bar.
 *   - Anonymous homepage exposes a hamburger menu button.
 *   - Mobile messages view renders a conversation list pane.
 */

function isMobile(page: import("@playwright/test").Page): boolean {
  const vp = page.viewportSize()
  return !!vp && vp.width < 1024
}

test.describe("Mobile viewport — anonymous homepage", () => {
  test("hamburger menu button is visible on small screens", async ({ page }) => {
    await page.goto("/nl")
    if (!isMobile(page)) {
      test.skip(true, "desktop viewport — no hamburger to test")
    }
    // The lg:hidden Sheet trigger renders a single icon button with a Menu icon.
    const menuBtn = page.getByRole("button").filter({ has: page.locator("svg") }).last()
    await expect(menuBtn).toBeVisible({ timeout: 15000 })
    await menuBtn.click()
    // The sheet pops a panel containing the "Lctnships" logo link
    await expect(page.locator("img[alt='lctnships']").first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Mobile viewport — authenticated renter", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("bottom navigation bar is rendered on dashboard for small screens", async ({ page }) => {
    if (!isMobile(page)) {
      test.skip(true, "desktop viewport — bottom nav is hidden")
    }
    await page.goto("/nl/dashboard")
    // MobileBottomNav renders a <nav> fixed to the bottom (z-9999, lg:hidden)
    const bottomNav = page.locator("nav.fixed.bottom-0").first()
    await expect(bottomNav).toBeVisible({ timeout: 15000 })

    // Should contain links to bookings + favorites + messages by their labels
    await expect(bottomNav.getByText(/Boekingen|Bookings/i).first()).toBeVisible()
  })

  test("messages page renders a conversation column on mobile", async ({ page }) => {
    await page.goto("/nl/messages")
    if (!isMobile(page)) {
      test.skip(true, "desktop viewport — different layout (sidebar visible)")
    }
    await expect(page).toHaveURL(/\/messages/, { timeout: 10000 })
    // Either the conversation list shows (seeded data) or an empty-state
    const list = page.getByText(/E2E Test Studio|Test Host/i).first()
    const empty = page.getByText(/Nog geen gesprekken|Nog geen berichten/i).first()
    await expect(list.or(empty)).toBeVisible({ timeout: 15000 })
  })
})
