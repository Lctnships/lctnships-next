import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_UNITS = new Set(["flat", "per_hour", "per_session"])

// PATCH /api/services/[id] — host updates one of their services
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { name, description, price, pricing_unit, studio_id, is_active } = body as {
    name?: string; description?: string | null; price?: number;
    pricing_unit?: string; studio_id?: string | null; is_active?: boolean;
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 })
    }
    update.name = name.trim()
  }
  if (description !== undefined) update.description = description
  if (price !== undefined) {
    if (typeof price !== "number" || price < 0 || !Number.isFinite(price)) {
      return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 })
    }
    update.price = price
  }
  if (pricing_unit !== undefined) {
    if (!VALID_UNITS.has(pricing_unit)) {
      return NextResponse.json({ error: "invalid pricing_unit" }, { status: 400 })
    }
    update.pricing_unit = pricing_unit
  }
  if (studio_id !== undefined) {
    if (studio_id !== null) {
      const { data: studio } = await supabase
        .from("studios")
        .select("id")
        .eq("id", studio_id)
        .eq("host_id", user.id)
        .maybeSingle()
      if (!studio) return NextResponse.json({ error: "Studio not owned by you" }, { status: 403 })
    }
    update.studio_id = studio_id
  }
  if (is_active !== undefined) update.is_active = !!is_active

  // RLS will refuse if the row doesn't belong to this host.
  const { data, error } = await supabase
    .from("services")
    .update(update)
    .eq("id", id)
    .eq("host_id", user.id)
    .select("*")
    .single()
  if (error || !data) {
    logger.error("Failed to update service", error, { serviceId: id })
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
  return NextResponse.json({ service: data })
}

// DELETE /api/services/[id] — host removes one of their services.
// Hard delete is fine because booking_services snapshots price + name at booking time;
// existing bookings retain the historical price.
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id)
  if (error) {
    if (error.code === "23503") {
      // FK violation: an existing booking_services row references this service.
      // Safer to deactivate than hard-delete in this case.
      return NextResponse.json(
        { error: "Cannot delete: service is attached to existing bookings. Deactivate it instead." },
        { status: 409 }
      )
    }
    logger.error("Failed to delete service", error, { serviceId: id })
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
