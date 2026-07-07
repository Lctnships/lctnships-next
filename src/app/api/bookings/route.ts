import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
  } catch (error: any) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
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
      notes,
      production_type,
      special_requests,
      equipment_selections,
    } = body

    const start = new Date(start_datetime)
    const end = new Date(end_datetime)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: "Invalid booking times" }, { status: 400 })
    }
    if (start < new Date()) {
      return NextResponse.json({ error: "Booking must be in the future" }, { status: 400 })
    }

    // Get studio details
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("host_id, instant_book, title, price_per_hour")
      .eq("id", studio_id)
      .single()

    if (studioError || !studio) {
      console.error("[bookings] studio lookup failed:", studio_id, studioError?.message)
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

    if (studio.host_id === user.id) {
      return NextResponse.json({ error: "You cannot book your own studio" }, { status: 400 })
    }

    // Block against already-confirmed bookings (pending requests may compete).
    // RPC is SECURITY DEFINER: RLS hides other renters' bookings from us here.
    const { data: slotTaken, error: conflictError } = await supabase.rpc(
      "booking_slot_taken",
      { p_studio_id: studio_id, p_start: start.toISOString(), p_end: end.toISOString() }
    )

    if (conflictError) throw conflictError
    if (slotTaken) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      )
    }

    // Recompute all amounts server-side — never trust client-sent prices
    const totalHours = Math.round(((end.getTime() - start.getTime()) / 3600000) * 100) / 100
    const studioTotal = studio.price_per_hour * totalHours

    const selections: Record<string, number> = equipment_selections || {}
    const equipmentIds = Object.keys(selections)
    let equipmentItems: {
      equipment_id: string
      quantity: number
      price_per_unit: number
      total_price: number
    }[] = []

    if (equipmentIds.length > 0) {
      const { data: equipmentRows, error: equipmentError } = await supabase
        .from("equipment")
        .select("id, price_per_day")
        .in("id", equipmentIds)

      if (equipmentError) throw equipmentError

      equipmentItems = (equipmentRows || []).map((eq) => {
        const quantity = Math.max(1, Number(selections[eq.id]) || 1)
        return {
          equipment_id: eq.id,
          quantity,
          price_per_unit: eq.price_per_day,
          total_price: eq.price_per_day * quantity,
        }
      })
    }

    const equipmentTotal = equipmentItems.reduce((sum, item) => sum + item.total_price, 0)
    const subtotal = studioTotal + equipmentTotal
    const serviceFee = Math.round(subtotal * 0.10)
    const totalAmount = subtotal + serviceFee
    const hostPayout = subtotal - Math.round(subtotal * 0.15)

    // Generate booking number
    const bookingNumber = `BK${Date.now().toString().slice(-8)}`

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_number: bookingNumber,
        studio_id,
        renter_id: user.id,
        host_id: studio.host_id,
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        total_hours: totalHours,
        subtotal,
        service_fee: serviceFee,
        total_amount: totalAmount,
        host_payout: hostPayout,
        status: studio.instant_book ? "confirmed" : "pending",
        payment_status: "pending",
        notes,
        production_type,
        special_requests,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Add equipment selections if any
    if (equipmentItems.length > 0) {
      await supabase.from("booking_equipment").insert(
        equipmentItems.map((item) => ({ ...item, booking_id: booking.id }))
      )
    }

    // Create notification for host
    await supabase.rpc("create_notification", {
      p_user_id: studio.host_id,
      p_type: "booking_request",
      p_title: studio.instant_book ? "New Booking Confirmed" : "New Booking Request",
      p_message: `You have a new booking for ${studio.title}`,
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
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    )
  }
}
