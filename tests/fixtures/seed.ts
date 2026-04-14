import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"
import { TEST_HOST, TEST_RENTER, TEST_STUDIO, TEST_STUDIO_REQUEST } from "./test-users"

function loadEnvLocal() {
  try {
    const contents = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of contents.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) continue
      const key = match[1]
      let value = match[2]
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env.local may not exist (e.g. CI uses real env)
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureAuthUser(email: string, password: string, fullName: string) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true })
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) throw error
  return data.user!.id
}

async function upsertProfile(id: string, email: string, fullName: string, userType: "host" | "renter") {
  const { error } = await admin
    .from("users")
    .upsert(
      { id, email, full_name: fullName, user_type: userType, onboarding_complete: true },
      { onConflict: "id" }
    )
  if (error) throw error
}

async function upsertStudio(
  hostId: string,
  config: { title: string; city: string; country: string; studioType: string; pricePerHour: number },
  instantBook: boolean,
) {
  const { data: existing } = await admin
    .from("studios")
    .select("id, is_instant_book")
    .eq("host_id", hostId)
    .eq("title", config.title)
    .maybeSingle()
  if (existing) {
    if (existing.is_instant_book !== instantBook) {
      await admin.from("studios").update({ is_instant_book: instantBook }).eq("id", existing.id)
    }
    return existing.id
  }

  const { data, error } = await admin
    .from("studios")
    .insert({
      host_id: hostId,
      owner_id: hostId,
      title: config.title,
      description: "E2E studio",
      type: config.studioType,
      city: config.city,
      country: config.country,
      location: `${config.city}, ${config.country}`,
      price_per_hour: config.pricePerHour,
      hourly_rate: config.pricePerHour,
      is_published: true,
      is_instant_book: instantBook,
      status: "published",
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id
}

async function upsertBooking(studioId: string, hostId: string, renterId: string) {
  const bookingNumber = "E2E-TEST-0001"
  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("booking_number", bookingNumber)
    .maybeSingle()

  const start = new Date()
  start.setDate(start.getDate() + 3)
  start.setHours(10, 0, 0, 0)
  const end = new Date(start)
  end.setHours(14, 0, 0, 0)

  const hours = 4
  const totalPrice = hours * TEST_STUDIO.pricePerHour
  const serviceFee = 0
  const hostPayout = Math.round(totalPrice * 0.85)

  const row = {
    booking_number: bookingNumber,
    studio_id: studioId,
    renter_id: renterId,
    user_id: renterId,
    host_id: hostId,
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    total_hours: hours,
    total_price: totalPrice,
    service_fee: serviceFee,
    total_amount: totalPrice,
    host_payout: hostPayout,
    status: "confirmed" as const,
    payment_status: "paid" as const,
  }

  if (existing) {
    const { error } = await admin.from("bookings").update(row).eq("id", existing.id)
    if (error) throw error
    return existing.id
  }
  const { data, error } = await admin.from("bookings").insert(row).select("id").single()
  if (error) throw error
  return data.id
}

async function upsertProject(renterId: string) {
  const title = "E2E Test Project"
  const { data: existing } = await admin
    .from("projects")
    .select("id")
    .eq("owner_id", renterId)
    .eq("title", title)
    .maybeSingle()
  if (existing) return existing.id
  const { data, error } = await admin
    .from("projects")
    .insert({
      owner_id: renterId,
      title,
      description: "Project created by Playwright fixture",
      type: "photoshoot",
      status: "active",
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id
}

async function upsertConversation(studioId: string, bookingId: string, hostId: string, renterId: string) {
  // One conversation per (studio, booking) pair is the practical uniqueness.
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("studio_id", studioId)
    .eq("booking_id", bookingId)
    .maybeSingle()

  let conversationId: string
  if (existing) {
    conversationId = existing.id
  } else {
    const { data, error } = await admin
      .from("conversations")
      .insert({ studio_id: studioId, booking_id: bookingId })
      .select("id")
      .single()
    if (error) throw error
    conversationId = data.id
  }

  // Participants (idempotent)
  for (const userId of [hostId, renterId]) {
    const { data: p } = await admin
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle()
    if (!p) {
      await admin.from("conversation_participants").insert({
        conversation_id: conversationId,
        user_id: userId,
      })
    }
  }

  // Reset conversation thread between runs: the renter-reply test spams new
  // messages that push the seeded host greeting off-screen in the UI, breaking
  // the "greeting is visible" assertions on subsequent runs.
  await admin.from("messages").delete().eq("conversation_id", conversationId)

  const seededContent = "Welcome! Looking forward to your session."
  await admin.from("messages").insert({
    conversation_id: conversationId,
    sender_id: hostId,
    content: seededContent,
  })

  return conversationId
}

export async function seed() {
  const hostId = await ensureAuthUser(TEST_HOST.email, TEST_HOST.password, TEST_HOST.fullName)
  const renterId = await ensureAuthUser(TEST_RENTER.email, TEST_RENTER.password, TEST_RENTER.fullName)
  await upsertProfile(hostId, TEST_HOST.email, TEST_HOST.fullName, "host")
  await upsertProfile(renterId, TEST_RENTER.email, TEST_RENTER.fullName, "renter")
  const studioId = await upsertStudio(hostId, TEST_STUDIO, true) // instant
  const requestStudioId = await upsertStudio(hostId, TEST_STUDIO_REQUEST, false) // on-request
  const bookingId = await upsertBooking(studioId, hostId, renterId)
  const projectId = await upsertProject(renterId)
  const conversationId = await upsertConversation(studioId, bookingId, hostId, renterId)
  return { hostId, renterId, studioId, requestStudioId, bookingId, projectId, conversationId }
}

if (require.main === module) {
  seed()
    .then((r) => {
      console.log("Seeded:", r)
      process.exit(0)
    })
    .catch((err) => {
      console.error("Seed failed:", err)
      process.exit(1)
    })
}
