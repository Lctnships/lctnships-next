import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET /api/favorites - Get user's favorite studios
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: favorites, error } = await supabase
      .from("favorites")
      .select(`
        id,
        created_at,
        studio:studios (
          id,
          title,
          city,
          country,
          price_per_hour,
          avg_rating,
          total_reviews,
          studio_images (id, image_url, is_cover)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ favorites })
  } catch (error: unknown) {
    logger.error("Error fetching favorites", error, { route: "GET /api/favorites" })
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Add studio to favorites
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { studio_id } = body

    if (!studio_id) {
      return NextResponse.json(
        { error: "Studio ID is required" },
        { status: 400 }
      )
    }

    // Validate studio_id is a valid UUID
    if (!/^[0-9a-f-]{36}$/i.test(studio_id)) {
      return NextResponse.json(
        { error: "Invalid studio ID" },
        { status: 400 }
      )
    }

    // Use upsert to handle race conditions atomically
    // If the favorite already exists, this will return the existing row
    const { data: favorite, error } = await supabase
      .from("favorites")
      .upsert(
        { user_id: user.id, studio_id },
        { onConflict: "user_id,studio_id", ignoreDuplicates: true }
      )
      .select()
      .single()

    // If upsert returns no data (duplicate was ignored), fetch the existing favorite
    if (!favorite && !error) {
      const { data: existingFavorite } = await supabase
        .from("favorites")
        .select()
        .eq("user_id", user.id)
        .eq("studio_id", studio_id)
        .single()

      return NextResponse.json({ favorite: existingFavorite }, { status: 200 })
    }

    if (error) throw error

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error: unknown) {
    logger.error("Error adding to favorites", error, { route: "POST /api/favorites" })
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Remove studio from favorites
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studioId = searchParams.get("studioId")

    if (!studioId) {
      return NextResponse.json(
        { error: "Studio ID is required" },
        { status: 400 }
      )
    }

    // Validate studioId is a valid UUID
    if (!/^[0-9a-f-]{36}$/i.test(studioId)) {
      return NextResponse.json(
        { error: "Invalid studio ID" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("studio_id", studioId)

    if (error) throw error

    return NextResponse.json({ message: "Removed from favorites" })
  } catch (error: unknown) {
    logger.error("Error removing from favorites", error, { route: "DELETE /api/favorites" })
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    )
  }
}
