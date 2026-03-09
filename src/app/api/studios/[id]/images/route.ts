import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/studios/[id]/images - Get studio images
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from("studio_images")
      .select("*")
      .eq("studio_id", id)
      .order("display_order", { ascending: true })

    if (error) throw error

    return NextResponse.json({ images })
  } catch (error: unknown) {
    logger.error("Error fetching studio images", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}

// POST /api/studios/[id]/images - Add image to studio
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: studio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", id)
      .single()

    if (!studio || studio.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to add images to this studio" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { image_url, is_cover, display_order } = body

    if (!image_url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // If this is being set as cover, remove cover from other images
    if (is_cover) {
      await supabase
        .from("studio_images")
        .update({ is_cover: false })
        .eq("studio_id", id)
    }

    // Get next display order if not provided
    let order = display_order
    if (order === undefined) {
      const { data: lastImage } = await supabase
        .from("studio_images")
        .select("display_order")
        .eq("studio_id", id)
        .order("display_order", { ascending: false })
        .limit(1)
        .single()

      order = (lastImage?.display_order || 0) + 1
    }

    const { data: image, error } = await supabase
      .from("studio_images")
      .insert({
        studio_id: id,
        image_url,
        is_cover: is_cover || false,
        display_order: order,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ image }, { status: 201 })
  } catch (error: unknown) {
    logger.error("Error adding studio image", error)
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    )
  }
}

// DELETE /api/studios/[id]/images - Delete image from studio
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: studio } = await supabase
      .from("studios")
      .select("host_id")
      .eq("id", id)
      .single()

    if (!studio || studio.host_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete images from this studio" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("studio_images")
      .delete()
      .eq("id", imageId)
      .eq("studio_id", id)

    if (error) throw error

    return NextResponse.json({ message: "Image deleted successfully" })
  } catch (error: unknown) {
    logger.error("Error deleting studio image", error)
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}
