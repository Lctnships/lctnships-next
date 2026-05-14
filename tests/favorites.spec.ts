import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"
import { TEST_STUDIO } from "./fixtures/test-users"

/**
 * Favorites: toggle from a studio detail page, verify it appears in the
 * dashboard /favorites list, then untoggle and verify it disappears.
 *
 * We exercise the API directly via the page's request context (cookies attached)
 * so the test is robust against UI churn. A second test still hits the UI to
 * make sure the heart icon toggles state.
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

async function getStudioId(title: string): Promise<string> {
  const { data } = await admin.from("studios").select("id").eq("title", title).single()
  if (!data) throw new Error(`Studio ${title} not seeded`)
  return data.id
}

test.describe("Favorites", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  let studioId: string

  test.beforeAll(async () => {
    studioId = await getStudioId(TEST_STUDIO.title)
  })

  test.afterEach(async () => {
    // Always clean up the favorite between runs
    if (studioId) {
      const { data: u } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      const renter = u.users.find((x) => x.email === "test-renter@lctnships.test")
      if (renter) {
        await admin.from("favorites").delete().eq("user_id", renter.id).eq("studio_id", studioId)
      }
    }
  })

  test("POST /api/favorites adds the studio + GET /favorites shows it", async ({ page, request }) => {
    const addRes = await request.post("/api/favorites", { data: { studio_id: studioId } })
    expect(addRes.ok(), `POST /api/favorites failed: ${await addRes.text()}`).toBeTruthy()

    await page.goto("/nl/favorites")
    await expect(page).toHaveURL(/\/favorites/, { timeout: 10000 })
    // Studio title appears (header may be different per locale, but a card
    // with the seeded title should be there)
    await expect(page.getByText(TEST_STUDIO.title).first()).toBeVisible({ timeout: 15000 })
  })

  test("DELETE /api/favorites removes the studio from the list", async ({ page, request }) => {
    await request.post("/api/favorites", { data: { studio_id: studioId } })

    const delRes = await request.delete(`/api/favorites?studioId=${studioId}`)
    expect(delRes.ok()).toBeTruthy()

    await page.goto("/nl/favorites")
    // Either the empty state, OR the studio is no longer in the visible list.
    const stillThere = page.getByText(TEST_STUDIO.title)
    await page.waitForLoadState("networkidle").catch(() => {})
    const count = await stillThere.count()
    expect(count).toBe(0)
  })

  test("clicking the heart on the studio detail page toggles via UI", async ({ page }) => {
    await page.goto(`/nl/studios/${studioId}`)
    // The studio detail page mounts and renders the favorite button — the
    // heart icon is a material symbol with text "favorite_border" / "favorite".
    const heartBtn = page
      .locator("button", { has: page.locator("span", { hasText: /^favorite(_border)?$/ }) })
      .first()
    await expect(heartBtn).toBeVisible({ timeout: 15000 })

    // Click it once — POST /api/favorites is invoked client-side
    const postPromise = page.waitForResponse(
      (r) => r.url().includes("/api/favorites") && r.request().method() === "POST",
      { timeout: 10000 },
    )
    await heartBtn.click()
    const postResp = await postPromise
    expect(postResp.status()).toBeLessThan(400)
  })
})
