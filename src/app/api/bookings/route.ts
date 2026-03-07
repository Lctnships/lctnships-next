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
  } catch (error: unknown) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bookings" },
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
      total_hours,
      subtotal,
      service_fee,
      total_amount,
      host_payout,
      notes,
      production_type,
      special_requests,
      equipment_selections,
    } = body

    // Get studio details
    const { data: studio, error: studioError } = await supabase
      .from("studios")
      .select("host_id, instant_book, title")
      .eq("id", studio_id)
      .single()

    if (studioError || !studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 })
    }

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
        start_datetime,
        end_datetime,
        total_hours,
        subtotal,
        service_fee,
        total_amount,
        host_payout,
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
    if (equipment_selections && Object.keys(equipment_selections).length > 0) {
      const equipmentItems = Object.entries(equipment_selections).map(([id, qty]) => ({
        booking_id: booking.id,
        equipment_id: id,
        quantity: qty as number,
        price_per_unit: 0, // Will be updated from equipment table
        total_price: 0,
      }))

      await supabase.from("booking_equipment").insert(equipmentItems)
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
  } catch (error: unknown) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    )
  }
}
