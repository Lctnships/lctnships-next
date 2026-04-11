import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { randomBytes } from "crypto"

interface RouteParams {
  params: Promise<{ id: string }>
}

const PLATFORM_FEE_PERCENTAGE = 0.15

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { extra_hours } = body

    if (!extra_hours || extra_hours < 0.5 || extra_hours > 24) {
      return NextResponse.json({ error: "Invalid extra hours" }, { status: 400 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (
          id,
          title,
          price_per_hour,
          booking_mode,
          booking_blocks,
          allow_extensions,
          max_extension_hours
        ),
        booking_equipment (
          id,
          quantity,
          price_per_unit,
          equipment (id, name, price_per_day)
        )
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.renter_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to extend this booking" }, { status: 403 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: "Only confirmed bookings can be extended" }, { status: 400 })
    }

    if (booking.studio.allow_extensions === false) {
      return NextResponse.json({ error: "Extensions not allowed for this studio" }, { status: 400 })
    }

    const extensionHours = Math.ceil(extra_hours)

    const { data: availability } = await supabase.rpc('get_extension_availability', {
      p_booking_id: bookingId
    })

    const availableHours = availability?.[0]?.available_hours || 0
    
    if (extensionHours > availableHours) {
      return NextResponse.json({ 
        error: `Only ${Math.floor(availableHours)} hours available for extension` 
      }, { status: 400 })
    }

    let studioPricePerHour: number
    if (booking.studio.booking_mode === 'fixed_blocks' && booking.studio.booking_blocks) {
      const hours = booking.total_hours + extra_hours
      const block = booking.studio.booking_blocks.find((b: { duration_hours: number }) => b.duration_hours >= hours)
      studioPricePerHour = block ? block.price / block.duration_hours : booking.studio.price_per_hour
    } else {
      studioPricePerHour = booking.studio.price_per_hour
    }

    const studioExtensionPrice = Math.round(studioPricePerHour * extra_hours * 100) / 100

    let equipmentExtensionPrice = 0
    const extensionItems: { equipment_id: string; equipment_name: string; price_per_hour: number; hours: number; subtotal: number }[] = []

    if (booking.booking_equipment && booking.booking_equipment.length > 0) {
      for (const item of booking.booking_equipment) {
        if (item.equipment) {
          const equipmentPricePerHour = item.equipment.price_per_day / 8
          const itemSubtotal = Math.round(equipmentPricePerHour * extra_hours * 100) / 100
          equipmentExtensionPrice += itemSubtotal

          extensionItems.push({
            equipment_id: item.equipment.id,
            equipment_name: item.equipment.name,
            price_per_hour: equipmentPricePerHour,
            hours: extra_hours,
            subtotal: itemSubtotal
          })
        }
      }
    }

    const totalExtensionPrice = studioExtensionPrice + equipmentExtensionPrice
    const commissionAmount = Math.round(totalExtensionPrice * PLATFORM_FEE_PERCENTAGE * 100) / 100
    const hostPayout = Math.round(totalExtensionPrice * (1 - PLATFORM_FEE_PERCENTAGE) * 100) / 100

    const { data: extension, error: extensionError } = await supabase
      .from("booking_extensions")
      .insert({
        booking_id: bookingId,
        renter_id: user.id,
        host_id: booking.host_id,
        studio_id: booking.studio_id,
        extra_hours: extra_hours,
        studio_extension_price: studioExtensionPrice,
        equipment_extension_price: equipmentExtensionPrice,
        total_extension_price: totalExtensionPrice,
        commission_amount: commissionAmount,
        host_payout: hostPayout,
        payment_status: 'pending',
        status: 'active'
      })
      .select()
      .single()

    if (extensionError) throw extensionError

    if (extensionItems.length > 0) {
      const itemsToInsert = extensionItems.map(item => ({
        extension_id: extension.id,
        equipment_id: item.equipment_id,
        equipment_name: item.equipment_name,
        price_per_hour: item.price_per_hour,
        hours: item.hours,
        subtotal: item.subtotal
      }))

      const { error: itemsError } = await supabase
        .from("booking_extension_items")
        .insert(itemsToInsert)

      if (itemsError) throw itemsError
    }

    return NextResponse.json({
      extension,
      items: extensionItems,
      pricing: {
        studio_price_per_hour: studioPricePerHour,
        studio_extension: studioExtensionPrice,
        equipment_extension: equipmentExtensionPrice,
        total: totalExtensionPrice,
        commission: commissionAmount,
        host_payout: hostPayout
      },
      available_hours: availableHours
    })

  } catch (error: unknown) {
    logger.error("Error creating extension", error)
    return NextResponse.json(
      { error: "Failed to create extension" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: bookingId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("renter_id, host_id, status")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.renter_id !== user.id && booking.host_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { data: availability } = await supabase.rpc('get_extension_availability', {
      p_booking_id: bookingId
    })

    const { data: extensions } = await supabase
      .from("booking_extensions")
      .select(`
        *,
        items:booking_extension_items (
          id,
          equipment_id,
          equipment_name,
          price_per_hour,
          hours,
          subtotal
        )
      `)
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      availability: availability?.[0] || { available_hours: 0, conflict_type: null },
      extensions: extensions || []
    })

  } catch (error: unknown) {
    logger.error("Error fetching extension info", error)
    return NextResponse.json(
      { error: "Failed to fetch extension info" },
      { status: 500 }
    )
  }
}