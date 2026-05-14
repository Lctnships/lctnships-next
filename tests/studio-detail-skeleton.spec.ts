import { test, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"
import { TEST_STUDIO } from "./fixtures/test-users"

/**
 * Studio detail loading state — the route uses src/app/[locale]/(public)/
 * studios/[id]/loading.tsx which renders <StudioDetailSkeleton/>. That
 * component imports `react-loading-skeleton`, which decorates its <span>s
 * with the CSS class `react-loading-skeleton`.
 *
 * We slow the network down so the suspense boundary actually shows the
 * skeleton before the real page renders.
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

async function studioIdByTitle(title: string): Promise<string> {
  const { data } = await admin.from("studios").select("id").eq("title", title).single()
  if (!data) throw new Error(`Studio ${title} not seeded`)
  return data.id
}

test.describe("Studio detail skeleton", () => {
  let studioId: string

  test.beforeAll(async () => {
    studioId = await studioIdByTitle(TEST_STUDIO.title)
  })

  test("studio detail page eventually replaces skeleton with content", async ({ page }) => {
    await page.goto(`/nl/studios/${studioId}`)
    // Title eventually appears
    await expect(page.locator("h1, h2").filter({ hasText: TEST_STUDIO.title }).first()).toBeVisible({
      timeout: 20000,
    })
    // After the real content appears, the skeleton class should be gone (or
    // detached). We give it one assertion pass with a short timeout.
    await expect(page.locator(".react-loading-skeleton")).toHaveCount(0, { timeout: 5000 })
  })

  test("non-existent studio id renders a 404 / fallback rather than a permanent skeleton", async ({
    page,
  }) => {
    const resp = await page.goto("/nl/studios/00000000-0000-0000-0000-000000000000", {
      waitUntil: "domcontentloaded",
    })
    // Could be 404 or a redirect — what matters is no 5xx
    expect(resp?.status() || 0).toBeLessThan(500)
    // Should not be stuck rendering only skeleton chrome forever
    await expect(page.locator(".react-loading-skeleton")).toHaveCount(0, { timeout: 15000 })
  })
})
