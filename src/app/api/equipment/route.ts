import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/equipment - Get equipment (by studio)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const studioId = searchParams.get("studio_id")

    if (!studioId) {
      return NextResponse.json(
        { error: "Studio ID is required" },
        { status: 400 }
      )
    }

    // Check if the requesting user is the host of this studio
    const { data: { user } } = await supabase.auth.getUser()
    const { data: studio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", studioId)
      .single()

    const isHost = user && studio && studio.host_id === user.id

    let query = supabase
      .from("equipment")
      .select("*")
      .eq("studio_id", studioId)

    // Only filter on is_available for non-hosts
    if (!isHost) {
      query = query.eq("is_available", true)
    }

    const { data: equipment, error } = await query.order("name")

    if (error) throw error

    return NextResponse.json({ equipment })
  } catch (error: unknown) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    )
  }
}

// POST /api/equipment - Add new equipment
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { studio_id, name, description, category, price_per_day, quantity, image_url } = body

    if (!studio_id || !name) {
      return NextResponse.json(
        { error: "Studio ID and name are required" },
        { status: 400 }
      )
    }

    // Verify user owns the studio
    const { data: studio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", studio_id)
      .single()

    if (!studio || studio.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to add equipment to this studio" },
        { status: 403 }
      )
    }

    const { data: equipment, error } = await supabase
      .from("equipment")
      .insert({
        studio_id,
        name,
        description,
        category,
        price_per_day: price_per_day || 0,
        quantity: quantity || 1,
        image_url,
        is_available: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ equipment })
  } catch (error: unknown) {
    console.error("Error adding equipment:", error)
    return NextResponse.json(
      { error: "Failed to add equipment" },
      { status: 500 }
    )
  }
}
