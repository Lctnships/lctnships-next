import { test, expect, APIRequestContext } from "@playwright/test"
import { HOST_STORAGE_STATE, RENTER_STORAGE_STATE } from "./fixtures/global-setup"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

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
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function studioIdByTitle(title: string): Promise<string> {
  const { data, error } = await admin.from("studios").select("id").eq("title", title).single()
  if (error || !data) throw new Error(`studio ${title} not found: ${error?.message}`)
  return data.id
}

async function postBookingRequest(request: APIRequestContext, studioId: string) {
  const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  start.setHours(10, 0, 0, 0)
  const end = new Date(start)
  end.setHours(14, 0, 0, 0)
  const subtotal = 4 * 40
  return request.post("/api/bookings", {
    data: {
      studio_id: studioId,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      total_hours: 4,
      subtotal,
      service_fee: Math.round(subtotal * 0.15 * 100) / 100,
      total_amount: subtotal,
      host_payout: Math.round(subtotal * 0.85 * 100) / 100,
      notes: "E2E booking flow test",
      production_type: "photoshoot",
      equipment_selections: {},
    },
  })
}

test.describe("Booking flow: on-request", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("renter submits request → booking lands in pending_approval", async ({ request }) => {
    const studioId = await studioIdByTitle("E2E Request Studio")
    const res = await postBookingRequest(request, studioId)
    expect(res.ok(), `POST /api/bookings failed: ${await res.text()}`).toBeTruthy()
    const { booking } = await res.json()
    expect(booking.status).toBe("pending_approval")
    expect(booking.payment_status).toBe("none")
    expect(booking.request_expires_at).not.toBeNull()

    // Cleanup — don't leave pending_approval rows around between runs
    await admin.from("bookings").delete().eq("id", booking.id)
  })
})

test.describe("Booking flow: on-request host approval", () => {
  test("host approves → status=approved + payment_deadline set", async ({ browser, request }) => {
    // Renter creates the request
    const renterContext = await browser.newContext({ storageState: RENTER_STORAGE_STATE, baseURL: "http://localhost:3002" })
    const renterReq = renterContext.request
    const studioId = await studioIdByTitle("E2E Request Studio")
    const createRes = await postBookingRequest(renterReq, studioId)
    expect(createRes.ok()).toBeTruthy()
    const { booking } = await createRes.json()
    await renterContext.close()

    // Host approves via its own session
    const hostContext = await browser.newContext({ storageState: HOST_STORAGE_STATE, baseURL: "http://localhost:3002" })
    const approveRes = await hostContext.request.post(`/api/bookings/${booking.id}/approve`)
    expect(approveRes.ok(), `approve failed: ${await approveRes.text()}`).toBeTruthy()
    await hostContext.close()

    const { data: after } = await admin.from("bookings").select("status, payment_status, payment_deadline").eq("id", booking.id).single()
    expect(after?.status).toBe("approved")
    expect(after?.payment_status).toBe("awaiting_payment")
    expect(after?.payment_deadline).not.toBeNull()

    await admin.from("bookings").delete().eq("id", booking.id)

    // Silence unused param
    void request
  })

  test("host rejects → status=rejected", async ({ browser, request }) => {
    const renterContext = await browser.newContext({ storageState: RENTER_STORAGE_STATE, baseURL: "http://localhost:3002" })
    const studioId = await studioIdByTitle("E2E Request Studio")
    const createRes = await postBookingRequest(renterContext.request, studioId)
    expect(createRes.ok()).toBeTruthy()
    const { booking } = await createRes.json()
    await renterContext.close()

    const hostContext = await browser.newContext({ storageState: HOST_STORAGE_STATE, baseURL: "http://localhost:3002" })
    const rejectRes = await hostContext.request.post(`/api/bookings/${booking.id}/reject`, {
      data: { reason: "Niet beschikbaar" },
    })
    expect(rejectRes.ok(), `reject failed: ${await rejectRes.text()}`).toBeTruthy()
    await hostContext.close()

    const { data: after } = await admin.from("bookings").select("status, rejected_reason").eq("id", booking.id).single()
    expect(after?.status).toBe("rejected")
    expect(after?.rejected_reason).toBe("Niet beschikbaar")

    await admin.from("bookings").delete().eq("id", booking.id)
    void request
  })
})

test.describe("Booking flow: instant-book", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("renter books instant studio → booking pending + awaiting_payment (ready for Stripe)", async ({ request }) => {
    const studioId = await studioIdByTitle("E2E Test Studio")
    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    start.setHours(10, 0, 0, 0)
    const end = new Date(start)
    end.setHours(14, 0, 0, 0)
    const subtotal = 4 * 50
    const res = await request.post("/api/bookings", {
      data: {
        studio_id: studioId,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        total_hours: 4,
        subtotal,
        service_fee: Math.round(subtotal * 0.15 * 100) / 100,
        total_amount: subtotal,
        host_payout: Math.round(subtotal * 0.85 * 100) / 100,
        notes: "E2E instant flow",
        production_type: "photoshoot",
        equipment_selections: {},
      },
    })
    expect(res.ok(), `POST /api/bookings failed: ${await res.text()}`).toBeTruthy()
    const { booking } = await res.json()
    expect(booking.status).toBe("pending")
    expect(booking.payment_status).toBe("awaiting_payment")
    expect(booking.request_expires_at).toBeNull()

    await admin.from("bookings").delete().eq("id", booking.id)
  })
})

test.describe("Booking flow: pay page gating", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("/bookings/[id]/pay redirects non-approved bookings", async ({ page, request }) => {
    // Create a pending_approval booking
    const studioId = await studioIdByTitle("E2E Request Studio")
    const createRes = await postBookingRequest(request, studioId)
    expect(createRes.ok()).toBeTruthy()
    const { booking } = await createRes.json()

    // Pay page must redirect — booking is not yet approved
    const resp = await page.goto(`/nl/bookings/${booking.id}/pay`, { waitUntil: "domcontentloaded" })
    expect(resp?.status()).toBeLessThan(500)
    expect(page.url()).not.toMatch(/\/pay(\?|$)/)

    await admin.from("bookings").delete().eq("id", booking.id)
  })
})
