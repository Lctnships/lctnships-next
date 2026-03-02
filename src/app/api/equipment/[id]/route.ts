import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/equipment/[id] - Get single equipment item
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: equipment, error } = await supabase
      .from("equipment")
      .select(`
        *,
        studio:studios (
          id,
          title,
          host_id
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ equipment })
  } catch (error: any) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipment" },
      { status: 500 }
    )
  }
}

// PATCH /api/equipment/[id] - Update equipment
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingEquipment } = await supabase
      .from("equipment")
      .select("studio:studios(host_id)")
      .eq("id", id)
      .single()

    if (!existingEquipment || (existingEquipment.studio as any)?.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this equipment" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const allowedFields = [
      "name",
      "description",
      "category",
      "studio_id",
      "price_per_day",
      "quantity",
      "is_available",
      "image_url",
    ]

    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data: equipment, error } = await supabase
      .from("equipment")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ equipment })
  } catch (error: any) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update equipment" },
      { status: 500 }
    )
  }
}

// DELETE /api/equipment/[id] - Delete equipment
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: existingEquipment } = await supabase
      .from("equipment")
      .select("studio:studios(host_id)")
      .eq("id", id)
      .single()

    if (!existingEquipment || (existingEquipment.studio as any)?.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this equipment" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Equipment deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting equipment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete equipment" },
      { status: 500 }
    )
  }
}
