import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

const VALID_UNITS = new Set(["flat", "per_hour", "per_session"])

// GET /api/services?studio_id=... → public list of active services for a studio
//                                   (or host-wide if studio_id is null match)
// GET /api/services?host=me      → host's own services (incl. inactive)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const studioId = url.searchParams.get("studio_id")
  const hostFilter = url.searchParams.get("host")
  const supabase = await createClient()

  if (hostFilter === "me") {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
    if (error) {
      logger.error("Failed to list host services", error)
      return NextResponse.json({ error: "Failed to list services" }, { status: 500 })
    }
    return NextResponse.json({ services: data ?? [] })
  }

  if (studioId) {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .or(`studio_id.eq.${studioId},studio_id.is.null`)
      .order("price", { ascending: true })
    if (error) {
      logger.error("Failed to list studio services", error)
      return NextResponse.json({ error: "Failed to list services" }, { status: 500 })
    }
    return NextResponse.json({ services: data ?? [] })
  }

  return NextResponse.json({ error: "Missing query: studio_id or host=me" }, { status: 400 })
}

// POST /api/services — host creates a new service
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { name, description, price, pricing_unit, studio_id, is_active } = body as {
    name?: string; description?: string; price?: number; pricing_unit?: string;
    studio_id?: string | null; is_active?: boolean;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }
  if (typeof price !== "number" || price < 0 || !Number.isFinite(price)) {
    return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 })
  }
  const unit = pricing_unit ?? "flat"
  if (!VALID_UNITS.has(unit)) {
    return NextResponse.json({ error: "pricing_unit must be flat | per_hour | per_session" }, { status: 400 })
  }

  // If studio_id is provided, verify the host actually owns the studio.
  if (studio_id) {
    const { data: studio } = await supabase
      .from("studios")
      .select("id")
      .eq("id", studio_id)
      .eq("host_id", user.id)
      .maybeSingle()
    if (!studio) {
      return NextResponse.json({ error: "Studio not found or not owned by you" }, { status: 403 })
    }
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      host_id: user.id,
      studio_id: studio_id ?? null,
      name: name.trim(),
      description: description ?? null,
      price,
      pricing_unit: unit,
      is_active: is_active ?? true,
    })
    .select("*")
    .single()

  if (error || !data) {
    logger.error("Failed to create service", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
  return NextResponse.json({ service: data }, { status: 201 })
}
