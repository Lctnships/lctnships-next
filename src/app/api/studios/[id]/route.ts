import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { invalidateCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { encryptStudioSecrets, decryptStudioSecrets } from "@/lib/encryption"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/studios/[id] - Get single studio with all details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: studio, error } = await supabase
      .from("studios")
      .select(`
        *,
        studio_images (id, image_url, is_cover, display_order),
        host:users!studios_host_id_fkey (
          id,
          full_name,
          avatar_url,
          bio,
          created_at
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          user:users!reviews_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        ),
        equipment (
          id,
          name,
          description,
          category,
          price_per_day,
          quantity,
          is_available,
          image_url
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Studio not found" }, { status: 404 })
      }
      throw error
    }

    // Check if user is authorized to see sensitive access info
    let canSeeSensitiveInfo = false

    if (user) {
      // Host can always see their own studio's access info
      if (studio.host_id === user.id) {
        canSeeSensitiveInfo = true
      } else {
        // Check if user has an active/confirmed booking for this studio
        const { data: activeBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("studio_id", id)
          .eq("renter_id", user.id)
          .in("status", ["confirmed", "in_progress"])
          .limit(1)
          .single()

        canSeeSensitiveInfo = !!activeBooking
      }
    }

    // Remove sensitive fields if user is not authorized, decrypt if authorized
    if (!canSeeSensitiveInfo) {
      delete studio.entry_code
      delete studio.wifi_password
      delete studio.access_instructions
    } else {
      // Decrypt the encrypted secrets for authorized users
      const decrypted = decryptStudioSecrets({
        entry_code: studio.entry_code,
        wifi_password: studio.wifi_password,
        access_instructions: studio.access_instructions,
      })
      studio.entry_code = decrypted.entry_code
      studio.wifi_password = decrypted.wifi_password
      studio.access_instructions = decrypted.access_instructions
    }

    // Get availability for next 30 days
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: bookings } = await supabase
      .from("bookings")
      .select("start_datetime, end_datetime")
      .eq("studio_id", id)
      .neq("status", "cancelled")
      .gte("start_datetime", today.toISOString())
      .lte("start_datetime", thirtyDaysFromNow.toISOString())

    return NextResponse.json({
      studio,
      bookedSlots: bookings || [],
    })
  } catch (error: unknown) {
    logger.error("Error fetching studio", error)
    return NextResponse.json(
      { error: "Failed to fetch studio" },
      { status: 500 }
    )
  }
}

// PATCH /api/studios/[id] - Update studio
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingStudio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", id)
      .single()

    if (!existingStudio || existingStudio.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this studio" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const allowedFields = [
      "title",
      "description",
      "type",
      "address",
      "city",
      "country",
      "postal_code",
      "latitude",
      "longitude",
      "price_per_hour",
      "daily_rate",
      "minimum_hours",
      "maximum_hours",
      "amenities",
      "rules",
      "cancellation_policy",
      "is_published",
      "entry_code",
      "wifi_password",
      "access_instructions",
    ]

    const sensitiveFields = ["entry_code", "wifi_password", "access_instructions"]
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Encrypt sensitive fields before saving
    if (sensitiveFields.some(f => updateData[f] !== undefined)) {
      const encrypted = encryptStudioSecrets({
        entry_code: updateData.entry_code as string | undefined,
        wifi_password: updateData.wifi_password as string | undefined,
        access_instructions: updateData.access_instructions as string | undefined,
      })
      if (updateData.entry_code !== undefined) updateData.entry_code = encrypted.entry_code
      if (updateData.wifi_password !== undefined) updateData.wifi_password = encrypted.wifi_password
      if (updateData.access_instructions !== undefined) updateData.access_instructions = encrypted.access_instructions
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data: studio, error } = await supabase
      .from("studios")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Invalidate both the general studios list cache and this specific studio cache
    await invalidateCache("studios:")
    await invalidateCache(`studios:${id}`)

    return NextResponse.json({ studio })
  } catch (error: unknown) {
    logger.error("Error updating studio", error)
    return NextResponse.json(
      { error: "Failed to update studio" },
      { status: 500 }
    )
  }
}

// DELETE /api/studios/[id] - Delete studio
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingStudio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", id)
      .single()

    if (!existingStudio || existingStudio.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this studio" },
        { status: 403 }
      )
    }

    // Check for active bookings
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("studio_id", id)
      .in("status", ["pending", "confirmed"])
      .limit(1)

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete studio with active bookings" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("studios")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Studio deleted successfully" })
  } catch (error: unknown) {
    logger.error("Error deleting studio", error)
    return NextResponse.json(
      { error: "Failed to delete studio" },
      { status: 500 }
    )
  }
}
