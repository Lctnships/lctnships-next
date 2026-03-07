import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/reviews/[id] - Get single review
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: review, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        booking:bookings (
          start_datetime,
          total_hours
        ),
        studio:studios (
          title,
          studio_images (image_url, is_cover)
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ review })
  } catch (error: unknown) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id] - Update review
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment, tags } = body

    // Check if user owns the review
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("reviewer_id")
      .eq("id", id)
      .single()

    if (!existingReview || existingReview.reviewer_id !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      )
    }

    // Update review
    const updateData: Record<string, unknown> = {
      is_edited: true,
      edited_at: new Date().toISOString(),
    }

    if (rating !== undefined) updateData.rating = rating
    if (comment !== undefined) updateData.comment = comment
    if (tags !== undefined) updateData.tags = tags

    const { data: review, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Rating will be auto-updated by trigger

    return NextResponse.json({ review })
  } catch (error: unknown) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the review
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("reviewer_id")
      .eq("id", id)
      .single()

    if (!existingReview || existingReview.reviewer_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)

    if (error) throw error

    // Rating will be auto-updated by trigger

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}
