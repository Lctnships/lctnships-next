import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/reviews - Get reviews (by studio or booking)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const studioId = searchParams.get("studio_id")
    const bookingId = searchParams.get("booking_id")
    const userId = searchParams.get("user_id")

    let query = supabase
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
        )
      `)
      .order("created_at", { ascending: false })

    if (studioId) {
      query = query.eq("studio_id", studioId)
    }

    if (bookingId) {
      query = query.eq("booking_id", bookingId)
    }

    if (userId) {
      query = query.eq("reviewer_id", userId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ reviews: data })
  } catch (error: unknown) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { booking_id, rating, comment, tags } = body

    if (!booking_id || !rating) {
      return NextResponse.json(
        { error: "Booking ID and rating are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Get booking and verify user can review
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, studio:studios(title)")
      .eq("id", booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is the renter
    if (booking.renter_id !== user.id) {
      return NextResponse.json(
        { error: "You can only review your own bookings" },
        { status: 403 }
      )
    }

    // Check if booking is completed
    if (booking.status !== "completed" && new Date(booking.end_datetime) > new Date()) {
      return NextResponse.json(
        { error: "You can only review completed bookings" },
        { status: 400 }
      )
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .eq("reviewer_id", user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this booking" },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        booking_id,
        studio_id: booking.studio_id,
        reviewer_id: user.id,
        reviewee_id: booking.host_id,
        review_type: "renter_to_studio",
        rating,
        comment,
        tags: tags || [],
      })
      .select()
      .single()

    if (reviewError) throw reviewError

    // The studio rating will be automatically updated by the database trigger

    // Update booking to mark as reviewed
    await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", booking_id)

    // Notify host
    await supabase.rpc("create_notification", {
      p_user_id: booking.host_id,
      p_type: "new_review",
      p_title: "New Review Received",
      p_message: `You received a ${rating}-star review for ${(booking.studio as { title?: string } | null)?.title}`,
      p_link: `/host/studios/${booking.studio_id}`,
    })

    return NextResponse.json({ review })
  } catch (error: unknown) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create review" },
      { status: 500 }
    )
  }
}
