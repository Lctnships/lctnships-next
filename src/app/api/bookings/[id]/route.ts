import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/bookings/[id] - Get single booking
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (
          *,
          studio_images (image_url, is_cover)
        ),
        host:users!bookings_host_id_fkey (*),
        renter:users!bookings_renter_id_fkey (*),
        booking_equipment (
          *,
          equipment (*)
        )
      `)
      .eq("id", id)
      .or(`renter_id.eq.${user.id},host_id.eq.${user.id}`)
      .single()

    if (error) throw error

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error: unknown) {
    logger.error("Error fetching booking", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings/[id] - Update booking
// TODO: Implement cron job or scheduled function to automatically
// set booking status to "completed" after end_datetime has passed.
// For now, hosts can manually mark bookings as completed.
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Get existing booking
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("*, studio:studios(title)")
      .eq("id", id)
      .or(`renter_id.eq.${user.id},host_id.eq.${user.id}`)
      .single()

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Determine user role and whitelist allowed fields
    const isHost = existingBooking.host_id === user.id
    const isRenter = existingBooking.renter_id === user.id

    // Fields that hosts can update
    const hostAllowedFields = ["status", "host_notes", "cancellation_reason"]
    // Fields that renters can update
    const renterAllowedFields = ["renter_notes", "special_requests"]
    // Fields that neither can update (protected)
    // payment_status, total_amount, stripe_payment_intent, host_id, renter_id, studio_id, etc.

    const allowedFields = isHost ? hostAllowedFields : isRenter ? renterAllowedFields : []

    // Validate host status transitions
    const VALID_HOST_TRANSITIONS: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
    }
    if (isHost && "status" in body) {
      const currentStatus = existingBooking.status
      const newStatus = body.status
      const allowed = VALID_HOST_TRANSITIONS[currentStatus] || []
      if (!allowed.includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot change status from '${currentStatus}' to '${newStatus}'` },
          { status: 400 }
        )
      }
    }

    // Filter body to only include allowed fields
    const sanitizedUpdate: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        sanitizedUpdate[field] = body[field]
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    // Update booking with sanitized data only
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        ...sanitizedUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ booking })
  } catch (error: unknown) {
    logger.error("Error updating booking", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}
