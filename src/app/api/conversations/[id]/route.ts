import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a participant
    const { data: participation } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .single()

    if (!participation) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      )
    }

    // Get conversation details
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select(`
        id,
        studio_id,
        booking_id,
        created_at,
        studio:studios (
          id,
          title,
          studio_images (image_url, is_cover)
        ),
        booking:bookings (
          id,
          booking_number,
          start_datetime,
          status
        ),
        conversation_participants (
          user_id,
          last_read_at,
          user:users (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        sender_id,
        created_at,
        is_read,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    if (messagesError) throw messagesError

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .eq("is_read", false)

    // Update last_read_at
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .eq("user_id", user.id)

    // Get other participant
    const participants = conversation?.conversation_participants || []
    const otherParticipant = participants.find((p: { user_id: string }) => p.user_id !== user.id)

    return NextResponse.json({
      conversation: {
        ...conversation,
        other_participant: otherParticipant?.user,
        messages,
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}
