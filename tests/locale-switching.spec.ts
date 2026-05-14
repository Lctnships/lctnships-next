import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Locale switching via URL prefix — verify key UI strings match the
 * messages/<locale>.json source for nl / en / de.
 *
 * We hit /messages (renter dashboard) because that route has stable
 * translation namespaces (Messages.title) in every locale file.
 */

type Bundle = Record<string, Record<string, string>>

function readBundle(locale: string): Bundle {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), `messages/${locale}.json`), "utf8"),
  ) as Bundle
}

test.describe("Locale switching", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("Dutch /nl/messages shows the nl Messages.title string", async ({ page }) => {
    const nl = readBundle("nl")
    const title = nl.Messages.title
    expect(title).toBeTruthy()
    await page.goto("/nl/messages")
    await expect(page).toHaveURL(/\/messages/, { timeout: 10000 })
    // Wait for the heading area to render
    await page.waitForLoadState("domcontentloaded")
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 })
  })

  test("English /en/messages shows the en Messages.title string", async ({ page }) => {
    const en = readBundle("en")
    const title = en.Messages.title
    expect(title).toBeTruthy()
    await page.goto("/en/messages")
    await expect(page).toHaveURL(/\/messages/, { timeout: 10000 })
    await page.waitForLoadState("domcontentloaded")
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 })
  })

  test("German /de/messages shows the de Messages.title string", async ({ page }) => {
    const de = readBundle("de")
    const title = de.Messages.title
    expect(title).toBeTruthy()
    await page.goto("/de/messages")
    await expect(page).toHaveURL(/\/messages/, { timeout: 10000 })
    await page.waitForLoadState("domcontentloaded")
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 })
  })

  test("Spanish /es/messages renders with es-localised title", async ({ page }) => {
    const es = readBundle("es")
    const title = es.Messages.title
    expect(title).toBeTruthy()
    await page.goto("/es/messages")
    await expect(page).toHaveURL(/\/messages/, { timeout: 10000 })
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 })
  })

  test("html lang attribute matches the URL locale", async ({ page }) => {
    await page.goto("/nl/messages")
    await expect(page.locator("html")).toHaveAttribute("lang", /nl/i, { timeout: 10000 })
    await page.goto("/en/messages")
    await expect(page.locator("html")).toHaveAttribute("lang", /en/i, { timeout: 10000 })
  })
})
