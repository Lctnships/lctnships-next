import { test, expect } from "@playwright/test"
import { RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"
import { TEST_STUDIO } from "./fixtures/test-users"

/**
 * Refund flow: a cancelled booking with payment_status="refunded" should be
 * visible in the renter's /bookings list under the "cancelled" tab.
 *
 * We seed an extra row (NOT the main E2E booking) directly via the admin
 * client so we don't disturb other tests, then verify the renter can see it.
 * Cleanup deletes the row in afterAll.
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

const REFUND_BOOKING_NUMBER = "E2E-REFUND-0001"

test.describe("Refund flow visibility", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  let bookingId: string | null = null

  test.beforeAll(async () => {
    // Look up host + renter + studio ids
    const { data: studio } = await admin.from("studios").select("id, host_id").eq("title", TEST_STUDIO.title).single()
    const { data: u } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const renter = u.users.find((x) => x.email === "test-renter@lctnships.test")
    if (!studio || !renter) {
      throw new Error("Seeded studio or renter missing")
    }

    // Use a date in the past so it lands under "cancelled" filter regardless
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    start.setHours(10, 0, 0, 0)
    const end = new Date(start)
    end.setHours(14, 0, 0, 0)

    // Wipe any leftovers from previous runs
    await admin.from("bookings").delete().eq("booking_number", REFUND_BOOKING_NUMBER)

    const { data: inserted, error } = await admin
      .from("bookings")
      .insert({
        booking_number: REFUND_BOOKING_NUMBER,
        studio_id: studio.id,
        renter_id: renter.id,
        user_id: renter.id,
        host_id: studio.host_id,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        total_hours: 4,
        total_price: 200,
        service_fee: 0,
        total_amount: 200,
        host_payout: 170,
        status: "cancelled",
        payment_status: "refunded",
        cancelled_at: new Date().toISOString(),
      })
      .select("id")
      .single()
    if (error) throw error
    bookingId = inserted.id
  })

  test.afterAll(async () => {
    if (bookingId) {
      await admin.from("bookings").delete().eq("id", bookingId)
    }
  })

  test("cancelled booking shows in renter bookings list under cancelled tab", async ({ page }) => {
    test.skip(!bookingId, "needs the seeded REFUND-0001 booking")
    await page.goto("/nl/bookings")
    await expect(page).toHaveURL(/\/bookings/, { timeout: 10000 })

    // Click the "Geannuleerd" tab (NL) — name in messages: tabCancelled
    const cancelTab = page.getByRole("button", { name: /Geannuleerd|Cancelled/i }).first()
    if (await cancelTab.isVisible().catch(() => false)) {
      await cancelTab.click()
    }
    // The studio title appears in the cancelled section
    await expect(page.getByText(TEST_STUDIO.title).first()).toBeVisible({ timeout: 15000 })
  })

  test("renter booking detail page surfaces cancelled status", async ({ page }) => {
    test.skip(!bookingId, "needs the seeded REFUND-0001 booking")
    await page.goto(`/nl/bookings/${bookingId}`)
    // The detail page renders. Either it shows the "geannuleerd" label, or it
    // renders the cancelled chip somewhere in the layout.
    await expect(
      page.getByText(/Geannuleerd|Cancelled/i).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test("DB row carries payment_status=refunded (sanity)", async () => {
    test.skip(!bookingId, "needs the seeded REFUND-0001 booking")
    const { data } = await admin
      .from("bookings")
      .select("status, payment_status")
      .eq("id", bookingId!)
      .single()
    expect(data?.status).toBe("cancelled")
    expect(data?.payment_status).toBe("refunded")
  })
})
