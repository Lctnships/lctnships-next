import { test, expect } from "@playwright/test"
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

const HOST_ID = "740d2c91-d8a4-4d08-ad42-5718653c90d4"

test.describe("Services — host CRUD", () => {
  test.use({ storageState: HOST_STORAGE_STATE })

  test("host services page renders with seeded services", async ({ page }) => {
    await page.goto("/nl/host/services")
    await expect(page.getByRole("heading", { name: /Diensten/i }).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("E2E Studio Service (Lighting)")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("E2E Host-wide Service (Assistant)")).toBeVisible({ timeout: 10000 })
  })

  test("host can create + delete a service via API", async ({ request }) => {
    const create = await request.post("/api/services", {
      data: { name: "Tmp service", price: 30, pricing_unit: "flat" },
    })
    expect(create.ok(), `POST /api/services failed: ${await create.text()}`).toBeTruthy()
    const { service } = await create.json()
    expect(service.name).toBe("Tmp service")

    const del = await request.delete(`/api/services/${service.id}`)
    expect(del.ok()).toBeTruthy()

    const { data: after } = await admin.from("services").select("id").eq("id", service.id).maybeSingle()
    expect(after).toBeNull()
  })

  test("host can toggle is_active via PATCH", async ({ request }) => {
    const create = await request.post("/api/services", {
      data: { name: "Toggle service", price: 10, pricing_unit: "per_hour" },
    })
    expect(create.ok()).toBeTruthy()
    const { service } = await create.json()

    const patch = await request.patch(`/api/services/${service.id}`, {
      data: { is_active: false },
    })
    expect(patch.ok()).toBeTruthy()
    const updated = await patch.json()
    expect(updated.service.is_active).toBe(false)

    await admin.from("services").delete().eq("id", service.id)
  })
})

test.describe("Services — renter visibility", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("public service list returns active host + studio services", async ({ request }) => {
    const studioId = "10ad6f39-db54-4699-b644-d72f6c8c992c" // E2E Test Studio
    const res = await request.get(`/api/services?studio_id=${studioId}`)
    expect(res.ok()).toBeTruthy()
    const { services } = await res.json()
    const names = (services as Array<{ name: string }>).map((s) => s.name)
    expect(names).toContain("E2E Studio Service (Lighting)")
    expect(names).toContain("E2E Host-wide Service (Assistant)")
  })
})

test.describe("Services — booking integration", () => {
  test.use({ storageState: RENTER_STORAGE_STATE })

  test("booking with services creates booking_services rows + correct total", async ({ request }) => {
    // Look up seeded service ids
    const { data: studioSvc } = await admin
      .from("services")
      .select("id, price")
      .eq("name", "E2E Studio Service (Lighting)")
      .single()
    const { data: hostSvc } = await admin
      .from("services")
      .select("id, price")
      .eq("name", "E2E Host-wide Service (Assistant)")
      .single()
    expect(studioSvc).not.toBeNull()
    expect(hostSvc).not.toBeNull()

    const studioId = "10ad6f39-db54-4699-b644-d72f6c8c992c" // instant-book studio
    const start = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    start.setHours(10, 0, 0, 0)
    const end = new Date(start)
    end.setHours(14, 0, 0, 0) // 4h
    const subtotal = 4 * 50 // E2E Test Studio price_per_hour=50 × 4h

    const res = await request.post("/api/bookings", {
      data: {
        studio_id: studioId,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        total_hours: 4,
        // purposely send studio-only total — server should rebuild + accept
        total_amount: subtotal + Number(studioSvc!.price) + Number(hostSvc!.price) * 4,
        notes: "with services",
        production_type: "photoshoot",
        equipment_selections: {},
        service_selections: { [studioSvc!.id]: 1, [hostSvc!.id]: 1 },
      },
    })
    expect(res.ok(), `POST /api/bookings failed: ${await res.text()}`).toBeTruthy()
    const { booking } = await res.json()

    const expectedTotal =
      subtotal +
      Number(studioSvc!.price) * 1 + // flat × 1
      Number(hostSvc!.price) * 1 * 4 // per_hour × 1 × 4h
    expect(Number(booking.total_amount)).toBeCloseTo(expectedTotal, 2)

    const { data: rows } = await admin
      .from("booking_services")
      .select("service_id, quantity, total_price")
      .eq("booking_id", booking.id)
    expect(rows?.length).toBe(2)

    // Cleanup
    await admin.from("booking_services").delete().eq("booking_id", booking.id)
    await admin.from("bookings").delete().eq("id", booking.id)
    void HOST_ID
  })
})
