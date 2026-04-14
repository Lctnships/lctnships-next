import { createClient, createServiceClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { logger } from "@/lib/logger"

// GET /api/bookings - Get user's bookings
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const role = searchParams.get("role") || "renter" // 'renter' or 'host'

    let query = supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (
          id,
          title,
          city,
          address,
          studio_images (image_url, is_cover)
        ),
        host:users!bookings_host_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        renter:users!bookings_renter_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .order("start_datetime", { ascending: false })

    // Filter by role
    if (role === "host") {
      query = query.eq("host_id", user.id)
    } else {
      query = query.eq("renter_id", user.id)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (error: unknown) {
    logger.error("Error fetching bookings", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      studio_id,
      start_datetime,
      end_datetime,
      total_amount, // Client-sent total for tolerance check
      notes,
      production_type,
      special_requests,
      equipment_selections,
      service_selections,
    } = body as {
      studio_id: string
      start_datetime: string
      end_datetime: string
      total_amount: number
      notes?: string | null
      production_type?: string | null
      special_requests?: string | null
      equipment_selections?: Record<string, number>
      service_selections?: Record<string, number>
    }

    // Get studio details for server-side price verification.
    // price_per_hour is the canonical column — all 12 prod studios have it set;
    // hourly_rate is legacy and NULL for every row. We keep hourly_rate as a
    // defensive fallback in case a future studio is created with only that
    // column populated, but new code should write price_per_hour.
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("host_id, is_instant_book, title, price_per_hour, hourly_rate, booking_mode, booking_blocks, booking_lead_time_hours")
      .eq("id", studio_id)
      .single()

    if (studioError || !studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

    // Lead time check — reject bookings where the renter hasn't given the host
    // enough advance notice. A lead time of 24 means the session must start at
    // least 24 hours from now. 0 disables the check.
    const startTime = new Date(start_datetime)
    const leadTimeHours = studio.booking_lead_time_hours || 0
    if (leadTimeHours > 0) {
      const hoursUntilStart = (startTime.getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntilStart < leadTimeHours) {
        return NextResponse.json(
          {
            error: `Deze studio vereist minimaal ${leadTimeHours} uur voorbereidingstijd. Je kunt niet eerder boeken dan ${leadTimeHours} uur van tevoren.`,
          },
          { status: 400 },
        )
      }
    }

    // Server-side price recalculation to prevent client-side price manipulation
    const endTime = new Date(end_datetime)
    const durationMs = endTime.getTime() - startTime.getTime()
    const calculatedHours = Math.max(1, Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100)
    const hourlyRate = studio.price_per_hour || studio.hourly_rate || 0

    // Price depends on the studio's booking_mode:
    //  - 'fixed_blocks': price is the block entry matching the requested
    //    duration (host-defined — NOT hourly × hours).
    //  - 'flexible' (or legacy null): standard hourly × hours math.
    // If a renter requests a duration that doesn't match any configured block
    // in fixed_blocks mode, we fall back to hourly × hours so the booking
    // still succeeds — but the client UI should only allow matching durations
    // when the studio is in fixed_blocks mode.
    let calculatedSubtotal: number
    if (studio.booking_mode === "fixed_blocks" && Array.isArray(studio.booking_blocks)) {
      const blocks = studio.booking_blocks as Array<{ duration_hours: number; price: number }>
      const matchingBlock = blocks.find((b) => b.duration_hours === calculatedHours)
      calculatedSubtotal = matchingBlock ? matchingBlock.price : calculatedHours * hourlyRate
    } else {
      calculatedSubtotal = calculatedHours * hourlyRate
    }
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100

    // Server-recalc equipment + services so renter can't tamper via the body.
    let equipmentTotalCalc = 0
    if (equipment_selections && Object.keys(equipment_selections).length > 0) {
      const ids = Object.keys(equipment_selections)
      const { data: rows } = await supabase
        .from("equipment")
        .select("id, price_per_day")
        .in("id", ids)
      const priceMap = new Map<string, number>()
      for (const r of rows ?? []) priceMap.set(r.id, r.price_per_day ?? 0)
      for (const [id, qty] of Object.entries(equipment_selections)) {
        equipmentTotalCalc += (priceMap.get(id) ?? 0) * (qty as number)
      }
    }
    let servicesTotalCalc = 0
    if (service_selections && Object.keys(service_selections).length > 0) {
      const ids = Object.keys(service_selections)
      const { data: rows } = await supabase
        .from("services")
        .select("id, price, pricing_unit, host_id, studio_id, is_active")
        .in("id", ids)
      for (const s of rows ?? []) {
        if (!s.is_active || s.host_id !== studio.host_id) continue
        if (s.studio_id !== null && s.studio_id !== studio_id) continue
        const qty = Math.max(1, Math.floor(service_selections[s.id] ?? 1))
        const multiplier = s.pricing_unit === "per_hour" ? calculatedHours : 1
        servicesTotalCalc += Number(s.price) * qty * multiplier
      }
    }
    equipmentTotalCalc = Math.round(equipmentTotalCalc * 100) / 100
    servicesTotalCalc = Math.round(servicesTotalCalc * 100) / 100

    // Renter pays studio + equipment + services. Platform keeps 15%, host gets 85%.
    const PLATFORM_FEE_PERCENTAGE = 0.15
    const calculatedTotal = Math.round((calculatedSubtotal + equipmentTotalCalc + servicesTotalCalc) * 100) / 100
    const calculatedServiceFee = Math.round(calculatedTotal * PLATFORM_FEE_PERCENTAGE * 100) / 100
    const calculatedHostPayout = Math.round(calculatedTotal * (1 - PLATFORM_FEE_PERCENTAGE) * 100) / 100

    // Verify client-supplied prices are within acceptable tolerance (2% for rounding)
    const tolerance = 0.02
    if (
      Math.abs(calculatedTotal - total_amount) / Math.max(calculatedTotal, 1) > tolerance
    ) {
      return NextResponse.json(
        { error: "Price mismatch detected. Please refresh and try again." },
        { status: 400 }
      )
    }

    // Generate crypto-random booking number
    const bookingNumber = `BK-${randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`

    // Branch by booking mode:
    //  - instant-book: booking lands in pending + awaiting_payment; client
    //    then opens a Stripe checkout session. Webhook confirms on payment.
    //  - on-request: booking lands in pending_approval + payment_status=none
    //    with a 48h soft-hold (request_expires_at). Host must approve first;
    //    only then does the renter get a payment link.
    const isInstant = !!studio.is_instant_book
    const requestExpiresAt = isInstant
      ? null
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_number: bookingNumber,
        studio_id,
        renter_id: user.id,
        user_id: user.id,
        host_id: studio.host_id,
        start_datetime,
        end_datetime,
        start_time: start_datetime,
        end_time: end_datetime,
        total_hours: calculatedHours,
        total_price: calculatedSubtotal,
        service_fee: calculatedServiceFee,
        total_amount: calculatedTotal,
        host_payout: calculatedHostPayout,
        status: isInstant ? "pending" : "pending_approval",
        payment_status: isInstant ? "awaiting_payment" : "none",
        request_expires_at: requestExpiresAt,
        notes,
        production_type,
        special_requests,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Add equipment selections if any, with actual prices from DB
    if (equipment_selections && Object.keys(equipment_selections).length > 0) {
      const equipmentIds = Object.keys(equipment_selections)

      // Fetch actual equipment prices from the database
      const { data: equipmentPrices, error: equipmentError } = await supabase
        .from("equipment")
        .select("id, price_per_day")
        .in("id", equipmentIds)

      if (equipmentError) {
        logger.error("Error fetching equipment prices", equipmentError)
      }

      // Build a price lookup map
      const priceMap = new Map<string, number>()
      if (equipmentPrices) {
        for (const eq of equipmentPrices) {
          priceMap.set(eq.id, eq.price_per_day ?? 0)
        }
      }

      const equipmentItems = Object.entries(equipment_selections).map(([id, qty]) => {
        const quantity = qty as number
        const pricePerUnit = priceMap.get(id) ?? 0
        return {
          booking_id: booking.id,
          equipment_id: id,
          quantity,
          price_per_unit: pricePerUnit,
          total_price: Math.round(pricePerUnit * quantity * 100) / 100,
        }
      })

      await supabase.from("booking_equipment").insert(equipmentItems)
    }

    // Add services. Server re-fetches prices/units to prevent client tampering;
    // unit determines multiplier (per_hour × hours, per_session × 1, flat × 1).
    if (service_selections && Object.keys(service_selections).length > 0) {
      const serviceIds = Object.keys(service_selections)
      const { data: svcRows, error: svcErr } = await supabase
        .from("services")
        .select("id, price, pricing_unit, host_id, studio_id, is_active")
        .in("id", serviceIds)
      if (svcErr) {
        logger.error("Error fetching services for booking", svcErr)
      }

      const items = (svcRows ?? [])
        .filter((s) => s.is_active && s.host_id === studio.host_id)
        .filter((s) => s.studio_id === null || s.studio_id === studio_id)
        .map((s) => {
          const qty = Math.max(1, Math.floor(service_selections![s.id] ?? 1))
          const multiplier =
            s.pricing_unit === "per_hour" ? calculatedHours :
            1
          const pricePerUnit = Number(s.price)
          const total = Math.round(pricePerUnit * qty * multiplier * 100) / 100
          return {
            booking_id: booking.id,
            service_id: s.id,
            quantity: qty,
            price_per_unit: pricePerUnit,
            pricing_unit: s.pricing_unit,
            total_price: total,
          }
        })

      if (items.length > 0) {
        // booking_services has SELECT policies for renter/host but no INSERT
        // policy for authenticated — server-controlled writes only.
        const adminWrite = await createServiceClient()
        const { error: insertErr } = await adminWrite.from("booking_services").insert(items)
        if (insertErr) {
          logger.error("Failed to insert booking_services", insertErr)
        }
      }
    }

    // Notify host. Instant-book: informational only (webhook will fire on
    // payment). On-request: host has 48h to Accept/Reject.
    await supabase.rpc("create_notification", {
      p_user_id: studio.host_id,
      p_type: isInstant ? "booking_pending_payment" : "booking_request",
      p_title: isInstant ? "New Booking (awaiting payment)" : "New Booking Request",
      p_message: isInstant
        ? `A new booking for ${studio.title} is awaiting renter payment.`
        : `You have a new booking request for ${studio.title}. Please approve or reject within 48 hours.`,
      p_link: `/host/bookings/${booking.id}`,
    })

    // Create conversation between renter and host
    await supabase.rpc("get_or_create_conversation", {
      p_user1_id: user.id,
      p_user2_id: studio.host_id,
      p_studio_id: studio_id,
      p_booking_id: booking.id,
    })

    return NextResponse.json({ booking })
  } catch (error: unknown) {
    logger.error("Error creating booking", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}
