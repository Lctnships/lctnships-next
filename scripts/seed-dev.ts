/**
 * Uitgebreid dev seeder voor lctnships.
 *
 * Doel: lokale DB volzetten met realistische test data over alle flows zodat
 * je door de app kunt klikken zonder eerst zelf hosts, studios, bookings en
 * conversations te moeten aanmaken.
 *
 * Run met:
 *   npx tsx scripts/seed-dev.ts
 *
 * Idempotent: her-runnen overschrijft niet, het slaat bestaande records over
 * waar mogelijk. Verwijdert dus geen data — gebruik `--reset` om alle seed-
 * records eerst weg te halen (alleen records met email-prefix "seed-").
 *
 * Vereist NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

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
    // Niet kritiek; CI gebruikt directe env vars.
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_PREFIX = "seed-"
const SEED_PASSWORD = "Seed!Pass-2026"

type UserType = "host" | "renter"

interface SeedUser {
  email: string
  fullName: string
  userType: UserType
  city?: string
}

const HOSTS: SeedUser[] = [
  { email: `${SEED_PREFIX}host-amsterdam@lctnships.test`, fullName: "Eva van der Berg", userType: "host", city: "Amsterdam" },
  { email: `${SEED_PREFIX}host-rotterdam@lctnships.test`, fullName: "Marco de Jong", userType: "host", city: "Rotterdam" },
  { email: `${SEED_PREFIX}host-utrecht@lctnships.test`, fullName: "Sophie Bakker", userType: "host", city: "Utrecht" },
  { email: `${SEED_PREFIX}host-haarlem@lctnships.test`, fullName: "Lars Visser", userType: "host", city: "Haarlem" },
  { email: `${SEED_PREFIX}host-berlin@lctnships.test`, fullName: "Klara Hoffmann", userType: "host", city: "Berlin" },
]

const RENTERS: SeedUser[] = [
  { email: `${SEED_PREFIX}renter-01@lctnships.test`, fullName: "Noa Jansen", userType: "renter" },
  { email: `${SEED_PREFIX}renter-02@lctnships.test`, fullName: "Liam de Vries", userType: "renter" },
  { email: `${SEED_PREFIX}renter-03@lctnships.test`, fullName: "Mila Smit", userType: "renter" },
  { email: `${SEED_PREFIX}renter-04@lctnships.test`, fullName: "Daan Mulder", userType: "renter" },
  { email: `${SEED_PREFIX}renter-05@lctnships.test`, fullName: "Sara El Amrani", userType: "renter" },
  { email: `${SEED_PREFIX}renter-06@lctnships.test`, fullName: "Tom Brouwer", userType: "renter" },
  { email: `${SEED_PREFIX}renter-07@lctnships.test`, fullName: "Eva Dekker", userType: "renter" },
  { email: `${SEED_PREFIX}renter-08@lctnships.test`, fullName: "Sem Kuiper", userType: "renter" },
  { email: `${SEED_PREFIX}renter-09@lctnships.test`, fullName: "Lotte Hendriks", userType: "renter" },
  { email: `${SEED_PREFIX}renter-10@lctnships.test`, fullName: "Finn Vermeer", userType: "renter" },
]

type StudioType = "photo" | "video" | "podcast" | "music" | "dance" | "creative"

interface SeedStudio {
  title: string
  description: string
  studioType: StudioType
  city: string
  country: string
  pricePerHour: number
  capacity: number
  bookingMode: "flexible" | "fixed_blocks"
  bookingBlocks?: { duration_hours: number; price: number; sort_order: number }[]
  isInstantBook: boolean
  allowExtensions: boolean
  cancellationPolicy: "flexible" | "moderate" | "strict"
  bookingLeadTimeHours: number
  imageUrls: string[]
  amenities: string[]
}

// Realistische stock images van Unsplash — moeten op de SUPABASE_STORAGE host
// allowlist staan voor productie, maar voor dev seeding is dat ok.
const PHOTO = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600"
const VIDEO = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600"
const PODCAST = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600"
const MUSIC = "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1600"
const DANCE = "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600"
const CREATIVE = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600"

const STUDIOS: SeedStudio[] = [
  {
    title: "Daylight Loft Amsterdam Noord",
    description: "Heldere fotostudio met grote ramen op het noorden, witte cyclorama wall en 4m plafondhoogte.",
    studioType: "photo", city: "Amsterdam", country: "Netherlands",
    pricePerHour: 75, capacity: 8, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "moderate", bookingLeadTimeHours: 4,
    imageUrls: [PHOTO, CREATIVE, PHOTO], amenities: ["WiFi", "Parking", "Make-up area", "Coffee"],
  },
  {
    title: "Cyclorama Studio Westpoort",
    description: "Professionele video studio met cyclorama, 6m breed, drive-in toegang voor groot materiaal.",
    studioType: "video", city: "Amsterdam", country: "Netherlands",
    pricePerHour: 150, capacity: 15, bookingMode: "fixed_blocks",
    bookingBlocks: [
      { duration_hours: 4, price: 550, sort_order: 1 },
      { duration_hours: 8, price: 950, sort_order: 2 },
      { duration_hours: 12, price: 1300, sort_order: 3 },
    ],
    isInstantBook: false, allowExtensions: true, cancellationPolicy: "strict", bookingLeadTimeHours: 24,
    imageUrls: [VIDEO, VIDEO, CREATIVE], amenities: ["WiFi", "Parking", "Drive-in access", "Green screen"],
  },
  {
    title: "Sound Cabin Rotterdam",
    description: "Akoestisch geoptimaliseerde podcast studio voor 4 personen, broadcast mics, geluiddichte deuren.",
    studioType: "podcast", city: "Rotterdam", country: "Netherlands",
    pricePerHour: 45, capacity: 4, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "flexible", bookingLeadTimeHours: 2,
    imageUrls: [PODCAST, PODCAST], amenities: ["WiFi", "Coffee", "Recording booth"],
  },
  {
    title: "Black Box Rotterdam",
    description: "Volledig zwarte video studio met blackout en kleurgekalibreerde monitoring.",
    studioType: "video", city: "Rotterdam", country: "Netherlands",
    pricePerHour: 95, capacity: 10, bookingMode: "flexible",
    isInstantBook: false, allowExtensions: false, cancellationPolicy: "moderate", bookingLeadTimeHours: 12,
    imageUrls: [VIDEO, CREATIVE], amenities: ["Parking", "Make-up area"],
  },
  {
    title: "Vinyl Music Studio Utrecht",
    description: "Vintage music recording studio met analog console en akoestische live room.",
    studioType: "music", city: "Utrecht", country: "Netherlands",
    pricePerHour: 65, capacity: 6, bookingMode: "fixed_blocks",
    bookingBlocks: [
      { duration_hours: 4, price: 240, sort_order: 1 },
      { duration_hours: 8, price: 440, sort_order: 2 },
    ],
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "moderate", bookingLeadTimeHours: 6,
    imageUrls: [MUSIC, MUSIC], amenities: ["WiFi", "Coffee", "Backline"],
  },
  {
    title: "Dance Floor Utrecht Centrum",
    description: "Spiegelende dansstudio met sprung floor en sound system, 80m².",
    studioType: "dance", city: "Utrecht", country: "Netherlands",
    pricePerHour: 35, capacity: 20, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: false, cancellationPolicy: "flexible", bookingLeadTimeHours: 2,
    imageUrls: [DANCE], amenities: ["WiFi", "Showers", "Lockers"],
  },
  {
    title: "Creative Workshop Loft Utrecht",
    description: "Flexibele creatieve ruimte voor workshops, brainstorms en kleine evenementen.",
    studioType: "creative", city: "Utrecht", country: "Netherlands",
    pricePerHour: 55, capacity: 25, bookingMode: "flexible",
    isInstantBook: false, allowExtensions: true, cancellationPolicy: "moderate", bookingLeadTimeHours: 8,
    imageUrls: [CREATIVE], amenities: ["WiFi", "Coffee", "Whiteboard", "Projector"],
  },
  {
    title: "Photo Loft Haarlem Harbour",
    description: "Industriële fotostudio aan de haven, natuurlijk licht en hoge plafonds.",
    studioType: "photo", city: "Haarlem", country: "Netherlands",
    pricePerHour: 60, capacity: 6, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "flexible", bookingLeadTimeHours: 4,
    imageUrls: [PHOTO, CREATIVE], amenities: ["WiFi", "Parking", "Make-up area"],
  },
  {
    title: "Compact Podcast Pod Haarlem",
    description: "Klein maar fijn — een ingerichte pod voor solo en duo podcasts.",
    studioType: "podcast", city: "Haarlem", country: "Netherlands",
    pricePerHour: 30, capacity: 2, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: false, cancellationPolicy: "flexible", bookingLeadTimeHours: 1,
    imageUrls: [PODCAST], amenities: ["WiFi", "Coffee"],
  },
  {
    title: "Studio Schöneberg Berlin",
    description: "Großzügiges Fotostudio in Berlin Schöneberg, Hochstand und Tageslicht.",
    studioType: "photo", city: "Berlin", country: "Germany",
    pricePerHour: 80, capacity: 10, bookingMode: "fixed_blocks",
    bookingBlocks: [
      { duration_hours: 4, price: 290, sort_order: 1 },
      { duration_hours: 8, price: 540, sort_order: 2 },
    ],
    isInstantBook: false, allowExtensions: true, cancellationPolicy: "strict", bookingLeadTimeHours: 24,
    imageUrls: [PHOTO, CREATIVE], amenities: ["WiFi", "Parking", "Make-up area", "Wardrobe"],
  },
  {
    title: "Berlin Mitte Video Stage",
    description: "Großer Studio mit Greenscreen und LED-Wand, geeignet für virtuelle Produktionen.",
    studioType: "video", city: "Berlin", country: "Germany",
    pricePerHour: 200, capacity: 20, bookingMode: "fixed_blocks",
    bookingBlocks: [
      { duration_hours: 4, price: 750, sort_order: 1 },
      { duration_hours: 8, price: 1400, sort_order: 2 },
      { duration_hours: 12, price: 1950, sort_order: 3 },
    ],
    isInstantBook: false, allowExtensions: true, cancellationPolicy: "strict", bookingLeadTimeHours: 48,
    imageUrls: [VIDEO, VIDEO, CREATIVE], amenities: ["LED wall", "Green screen", "Drive-in access", "Make-up area"],
  },
  {
    title: "Music Loft Kreuzberg",
    description: "Aufnahmestudio mit klassischem U87, vintage compressors und live room.",
    studioType: "music", city: "Berlin", country: "Germany",
    pricePerHour: 70, capacity: 8, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "moderate", bookingLeadTimeHours: 6,
    imageUrls: [MUSIC], amenities: ["WiFi", "Backline", "Coffee"],
  },
  {
    title: "Dance Studio Friedrichshain",
    description: "Helles Tanzstudio mit Spiegelwand und schwingenden Holzboden.",
    studioType: "dance", city: "Berlin", country: "Germany",
    pricePerHour: 40, capacity: 25, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: false, cancellationPolicy: "flexible", bookingLeadTimeHours: 2,
    imageUrls: [DANCE], amenities: ["WiFi", "Showers", "Sound system"],
  },
  {
    title: "Photo Studio Light Box Amsterdam",
    description: "Compacte fotostudio met flits set en achtergrond systeem — ideaal voor product fotografie.",
    studioType: "photo", city: "Amsterdam", country: "Netherlands",
    pricePerHour: 50, capacity: 4, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "flexible", bookingLeadTimeHours: 2,
    imageUrls: [PHOTO], amenities: ["WiFi", "Make-up area"],
  },
  {
    title: "The Quiet Room Rotterdam",
    description: "Akoestisch behandelde room voor voice-over werk en kleine podcast opnames.",
    studioType: "podcast", city: "Rotterdam", country: "Netherlands",
    pricePerHour: 40, capacity: 3, bookingMode: "flexible",
    isInstantBook: true, allowExtensions: true, cancellationPolicy: "flexible", bookingLeadTimeHours: 2,
    imageUrls: [PODCAST], amenities: ["WiFi", "Coffee"],
  },
]

const EQUIPMENT_PRESETS = [
  { name: "Profoto B10 Plus kit", category: "lighting" as const, pricePerDay: 75 },
  { name: "Sennheiser MKH 416 boom mic", category: "audio" as const, pricePerDay: 45 },
  { name: "Canon EOS R5 + 24-70 RF", category: "camera" as const, pricePerDay: 120 },
  { name: "Colorama paper backdrop set", category: "backdrop" as const, pricePerDay: 25 },
  { name: "Pro make-up chair + ring light", category: "furniture" as const, pricePerDay: 30 },
]

const REVIEW_COMMENTS = [
  "Heel fijne studio, alles werkte prima en de host was super behulpzaam.",
  "Goede plek voor productfotografie, licht was top.",
  "Vlot geregeld, ruimte schoon en alles aanwezig. Komen zeker terug.",
  "Akoestiek was fantastisch — opname was meteen gebruiksklaar.",
  "Klein puntje: parking was lastig, maar verder geweldig.",
  "Top studio, hosts waren erg flexibel met onze planning.",
]

async function ensureAuthUser(user: SeedUser): Promise<string> {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 })
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === user.email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password: SEED_PASSWORD, email_confirm: true })
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.fullName },
  })
  if (error) throw error
  return data.user!.id
}

async function upsertProfile(id: string, user: SeedUser) {
  const { error } = await admin
    .from("users")
    .upsert(
      {
        id,
        email: user.email,
        full_name: user.fullName,
        user_type: user.userType,
        onboarding_complete: true,
        is_verified: true,
        location: user.city ?? null,
      },
      { onConflict: "id" },
    )
  if (error) throw error
}

async function upsertStudio(hostId: string, s: SeedStudio): Promise<string> {
  const { data: existing } = await admin
    .from("studios")
    .select("id")
    .eq("host_id", hostId)
    .eq("title", s.title)
    .maybeSingle()

  const row = {
    host_id: hostId,
    owner_id: hostId,
    title: s.title,
    description: s.description,
    type: s.studioType,
    city: s.city,
    country: s.country,
    location: `${s.city}, ${s.country}`,
    price_per_hour: s.pricePerHour,
    hourly_rate: s.pricePerHour,
    capacity: s.capacity,
    is_instant_book: s.isInstantBook,
    is_published: true,
    status: "published",
    allow_extensions: s.allowExtensions,
    booking_mode: s.bookingMode,
    booking_blocks: s.bookingBlocks ?? null,
    cancellation_policy: s.cancellationPolicy,
    booking_lead_time_hours: s.bookingLeadTimeHours,
  }

  let studioId: string
  if (existing) {
    const { error } = await admin.from("studios").update(row).eq("id", existing.id)
    if (error) throw error
    studioId = existing.id
  } else {
    const { data, error } = await admin.from("studios").insert(row).select("id").single()
    if (error) throw error
    studioId = data.id
  }

  // Images — alleen toevoegen als er nog geen zijn (anders duplicate per re-run)
  const { data: imgs } = await admin.from("studio_images").select("id").eq("studio_id", studioId).limit(1)
  if (!imgs || imgs.length === 0) {
    const rows = s.imageUrls.map((url, idx) => ({
      studio_id: studioId,
      image_url: url,
      is_cover: idx === 0,
      order_index: idx,
    }))
    const { error } = await admin.from("studio_images").insert(rows)
    if (error) throw error
  }

  // Amenities
  const { data: am } = await admin.from("studio_amenities").select("id").eq("studio_id", studioId).limit(1)
  if (!am || am.length === 0) {
    const rows = s.amenities.map((a) => ({ studio_id: studioId, amenity: a }))
    const { error } = await admin.from("studio_amenities").insert(rows)
    if (error) throw error
  }

  // Availability: ma-za 09:00-22:00
  const { data: av } = await admin.from("studio_availability").select("id").eq("studio_id", studioId).limit(1)
  if (!av || av.length === 0) {
    const rows = [1, 2, 3, 4, 5, 6].map((day) => ({
      studio_id: studioId,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "22:00:00",
      is_available: true,
    }))
    const { error } = await admin.from("studio_availability").insert(rows)
    if (error) throw error
  }

  return studioId
}

async function seedEquipmentForStudio(studioId: string) {
  const { data: existing } = await admin.from("equipment").select("id").eq("studio_id", studioId).limit(1)
  if (existing && existing.length > 0) return
  // 2-3 equipment items per studio
  const picks = EQUIPMENT_PRESETS.slice(0, 2 + Math.floor(Math.random() * 2))
  const rows = picks.map((p) => ({
    studio_id: studioId,
    name: p.name,
    description: `${p.name} beschikbaar als add-on voor je booking.`,
    category: p.category,
    price_per_day: p.pricePerDay,
    quantity: 1,
    is_available: true,
  }))
  const { error } = await admin.from("equipment").insert(rows)
  if (error) throw error
}

async function seedBlockedDates(studioId: string) {
  // 2 random blocked dates in komende 30 dagen
  const today = new Date()
  const dates: string[] = []
  for (let i = 0; i < 2; i++) {
    const offset = 5 + Math.floor(Math.random() * 25)
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    dates.push(d.toISOString().slice(0, 10))
  }
  for (const date of dates) {
    const { data: existing } = await admin
      .from("studio_blocked_dates")
      .select("id")
      .eq("studio_id", studioId)
      .eq("blocked_date", date)
      .maybeSingle()
    if (existing) continue
    await admin.from("studio_blocked_dates").insert({
      studio_id: studioId,
      blocked_date: date,
      reason: "Host onderhoud",
    })
  }
}

interface BookingSpec {
  bookingNumber: string
  studioId: string
  hostId: string
  renterId: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "refunded"
  daysFromNow: number
  durationHours: number
  requiresManualPayoutReversal?: boolean
}

async function upsertBooking(spec: BookingSpec): Promise<string> {
  const start = new Date()
  start.setDate(start.getDate() + spec.daysFromNow)
  start.setHours(10, 0, 0, 0)
  const end = new Date(start)
  end.setHours(start.getHours() + spec.durationHours)

  const { data: studio } = await admin
    .from("studios")
    .select("price_per_hour")
    .eq("id", spec.studioId)
    .single()
  const rate = (studio?.price_per_hour as number | undefined) ?? 50
  const subtotal = rate * spec.durationHours
  const serviceFee = 0
  const totalAmount = subtotal + serviceFee
  const hostPayout = Math.round(subtotal * 0.85)

  const row = {
    booking_number: spec.bookingNumber,
    studio_id: spec.studioId,
    renter_id: spec.renterId,
    user_id: spec.renterId,
    host_id: spec.hostId,
    start_datetime: start.toISOString(),
    end_datetime: end.toISOString(),
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    total_hours: spec.durationHours,
    subtotal,
    total_price: totalAmount,
    service_fee: serviceFee,
    total_amount: totalAmount,
    host_payout: hostPayout,
    status: spec.status,
    payment_status: spec.paymentStatus,
    requires_manual_payout_reversal: spec.requiresManualPayoutReversal ?? false,
  }

  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("booking_number", spec.bookingNumber)
    .maybeSingle()
  if (existing) {
    const { error } = await admin.from("bookings").update(row).eq("id", existing.id)
    if (error) throw error
    return existing.id
  }
  const { data, error } = await admin.from("bookings").insert(row).select("id").single()
  if (error) throw error
  return data.id
}

async function seedConversation(studioId: string, bookingId: string | null, hostId: string, renterId: string, messages: { from: "host" | "renter"; content: string }[]) {
  let conversationId: string
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("studio_id", studioId)
    .eq(bookingId ? "booking_id" : "id", bookingId ?? studioId) // hack om null te matchen, valt door op insert pad
    .maybeSingle()

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

  for (const userId of [hostId, renterId]) {
    const { data: p } = await admin
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle()
    if (!p) {
      await admin.from("conversation_participants").insert({ conversation_id: conversationId, user_id: userId })
    }
  }

  // Reset + re-insert messages voor consistent state per re-run
  await admin.from("messages").delete().eq("conversation_id", conversationId)
  for (const msg of messages) {
    await admin.from("messages").insert({
      conversation_id: conversationId,
      sender_id: msg.from === "host" ? hostId : renterId,
      content: msg.content,
    })
  }
  return conversationId
}

async function seedReview(bookingId: string, studioId: string, reviewerId: string, revieweeId: string, type: "renter_to_studio" | "host_to_renter") {
  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("review_type", type)
    .maybeSingle()
  if (existing) return
  await admin.from("reviews").insert({
    booking_id: bookingId,
    studio_id: studioId,
    reviewer_id: reviewerId,
    reviewee_id: revieweeId,
    review_type: type,
    rating: 4 + Math.floor(Math.random() * 2),
    comment: REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)],
  })
}

async function seedFavorite(userId: string, studioId: string) {
  const { data: existing } = await admin
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("studio_id", studioId)
    .maybeSingle()
  if (existing) return
  await admin.from("favorites").insert({ user_id: userId, studio_id: studioId })
}

async function seedCredits(userId: string, credits: number) {
  await admin
    .from("user_credits")
    .upsert(
      { user_id: userId, credits_remaining: credits, credits_total: credits },
      { onConflict: "user_id" },
    )
  const { data: txExisting } = await admin
    .from("credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "purchase")
    .limit(1)
  if (txExisting && txExisting.length > 0) return
  await admin.from("credit_transactions").insert({
    user_id: userId,
    type: "purchase",
    credits,
    description: "Seeded dev credits",
  })
}

async function seedPayout(hostId: string, bookingId: string, amount: number, status: "completed" | "failed") {
  const { data: existing } = await admin
    .from("payouts")
    .select("id")
    .eq("host_id", hostId)
    .eq("booking_id", bookingId)
    .maybeSingle()
  if (existing) return
  await admin.from("payouts").insert({
    host_id: hostId,
    booking_id: bookingId,
    amount,
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  })
}

async function seedNotification(userId: string, type: string, title: string, message: string, link: string) {
  await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    link,
  })
}

async function resetSeedRecords() {
  console.log("Reset: verwijder records met email-prefix", SEED_PREFIX)
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 })
  const seedUsers = list.users.filter((u) => u.email?.startsWith(SEED_PREFIX))
  for (const u of seedUsers) {
    await admin.auth.admin.deleteUser(u.id)
  }
  console.log(`Verwijderd: ${seedUsers.length} auth users (cascade ruimt rijen op)`)
}

async function run() {
  const reset = process.argv.includes("--reset")
  if (reset) await resetSeedRecords()

  console.log("→ Hosts aanmaken...")
  const hostIds: Record<string, string> = {}
  for (const h of HOSTS) {
    const id = await ensureAuthUser(h)
    await upsertProfile(id, h)
    hostIds[h.email] = id
  }

  console.log("→ Renters aanmaken...")
  const renterIds: string[] = []
  for (const r of RENTERS) {
    const id = await ensureAuthUser(r)
    await upsertProfile(id, r)
    renterIds.push(id)
  }

  console.log("→ Studios + images + amenities + availability...")
  const studioIds: string[] = []
  const studioByHost: Record<string, string[]> = {}
  const hostList = Object.values(hostIds)
  for (let i = 0; i < STUDIOS.length; i++) {
    const hostId = hostList[i % hostList.length]
    const studioId = await upsertStudio(hostId, STUDIOS[i])
    await seedEquipmentForStudio(studioId)
    await seedBlockedDates(studioId)
    studioIds.push(studioId)
    studioByHost[hostId] = studioByHost[hostId] || []
    studioByHost[hostId].push(studioId)
  }

  console.log("→ Bookings in alle statussen + reviews + payouts...")
  // Confirmed booking (toekomst) — voor cancel/extension testing
  const confirmedFuture = await upsertBooking({
    bookingNumber: "SEED-CONF-001",
    studioId: studioIds[0],
    hostId: hostList[0],
    renterId: renterIds[0],
    status: "confirmed",
    paymentStatus: "paid",
    daysFromNow: 7,
    durationHours: 4,
  })

  // Confirmed booking (snel — over 3 uur) voor extension reminder cron
  const confirmedSoon = await upsertBooking({
    bookingNumber: "SEED-CONF-002",
    studioId: studioIds[1],
    hostId: hostList[1],
    renterId: renterIds[1],
    status: "confirmed",
    paymentStatus: "paid",
    daysFromNow: 0,
    durationHours: 4,
  })

  // Completed booking met review
  const completed = await upsertBooking({
    bookingNumber: "SEED-COMP-001",
    studioId: studioIds[2],
    hostId: hostList[0],
    renterId: renterIds[2],
    status: "completed",
    paymentStatus: "paid",
    daysFromNow: -14,
    durationHours: 3,
  })
  await seedReview(completed, studioIds[2], renterIds[2], hostList[0], "renter_to_studio")
  await seedReview(completed, studioIds[2], hostList[0], renterIds[2], "host_to_renter")
  await seedPayout(hostList[0], completed, 191, "completed")

  // Cancelled booking met refund
  const cancelled = await upsertBooking({
    bookingNumber: "SEED-CANC-001",
    studioId: studioIds[3],
    hostId: hostList[1],
    renterId: renterIds[3],
    status: "cancelled",
    paymentStatus: "refunded",
    daysFromNow: 10,
    durationHours: 4,
  })

  // Pending booking (request flow — on-request studio)
  await upsertBooking({
    bookingNumber: "SEED-PEND-001",
    studioId: studioIds[6], // Creative Workshop = not instant book
    hostId: hostList[2],
    renterId: renterIds[4],
    status: "pending",
    paymentStatus: "pending",
    daysFromNow: 14,
    durationHours: 5,
  })

  // Edge case: refund na payout — requires_manual_payout_reversal flag
  const edgeRefund = await upsertBooking({
    bookingNumber: "SEED-EDGE-001",
    studioId: studioIds[4],
    hostId: hostList[2],
    renterId: renterIds[5],
    status: "cancelled",
    paymentStatus: "refunded",
    daysFromNow: -3,
    durationHours: 6,
    requiresManualPayoutReversal: true,
  })
  await seedPayout(hostList[2], edgeRefund, 332, "completed")

  // Failed payout (booking confirmed maar payout faalde)
  const failedPayoutBooking = await upsertBooking({
    bookingNumber: "SEED-PAY-FAIL-001",
    studioId: studioIds[5],
    hostId: hostList[2],
    renterId: renterIds[6],
    status: "completed",
    paymentStatus: "paid",
    daysFromNow: -7,
    durationHours: 2,
  })
  await seedPayout(hostList[2], failedPayoutBooking, 60, "failed")

  // Disputed booking (charge.dispute.created scenario)
  await upsertBooking({
    bookingNumber: "SEED-DISPUTE-001",
    studioId: studioIds[7],
    hostId: hostList[3],
    renterId: renterIds[7],
    status: "completed",
    paymentStatus: "paid",
    daysFromNow: -10,
    durationHours: 4,
    requiresManualPayoutReversal: true,
  })

  console.log("→ Conversations + messages...")
  // Conversation gekoppeld aan booking
  await seedConversation(
    studioIds[0],
    confirmedFuture,
    hostList[0],
    renterIds[0],
    [
      { from: "renter", content: "Hoi! Kijk er naar uit om volgende week te komen." },
      { from: "host", content: "Top! De ruimte is klaar voor jullie shoot." },
      { from: "renter", content: "Top, mogen we 30 min eerder komen om op te bouwen?" },
      { from: "host", content: "Ja prima, ik laat de deur dan al open." },
    ],
  )

  // Conversation zonder booking (direct van studio detail)
  await seedConversation(
    studioIds[5],
    null,
    hostList[2],
    renterIds[8],
    [
      { from: "renter", content: "Is de studio beschikbaar op zaterdag 14:00-18:00?" },
      { from: "host", content: "Ja dat past! Je kunt direct boeken via de pagina." },
    ],
  )

  console.log("→ Favorites...")
  // Eerste renter favorite 3 studios
  await seedFavorite(renterIds[0], studioIds[0])
  await seedFavorite(renterIds[0], studioIds[2])
  await seedFavorite(renterIds[0], studioIds[5])
  await seedFavorite(renterIds[1], studioIds[1])
  await seedFavorite(renterIds[1], studioIds[4])

  console.log("→ Credits...")
  await seedCredits(renterIds[0], 100)
  await seedCredits(renterIds[1], 50)

  console.log("→ Notifications...")
  await seedNotification(renterIds[0], "booking_confirmed", "Booking bevestigd", "Je booking SEED-CONF-001 is bevestigd.", "/bookings")
  await seedNotification(renterIds[0], "new_message", "Nieuw bericht", "Eva van der Berg heeft je een bericht gestuurd.", "/messages")
  await seedNotification(hostList[0], "new_booking", "Nieuwe boeking", "Noa Jansen heeft je studio geboekt.", "/host/bookings")

  console.log("\n✓ Seed compleet")
  console.log(`  Hosts:    ${HOSTS.length} (login: ${HOSTS[0].email} / ${SEED_PASSWORD})`)
  console.log(`  Renters:  ${RENTERS.length} (login: ${RENTERS[0].email} / ${SEED_PASSWORD})`)
  console.log(`  Studios:  ${STUDIOS.length} (5 cities, 6 types, 4 fixed-block + 11 flexible)`)
  console.log(`  Bookings: 8 (1 pending, 2 confirmed, 2 completed, 3 cancelled/edge)`)
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
