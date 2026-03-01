import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/conversations - Get user's conversations
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get conversations where user is a participant
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id)

    if (partError) throw partError

    if (!participations || participations.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const conversationIds = participations.map(p => p.conversation_id)

    // Get conversation details with last message and other participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        studio_id,
        booking_id,
        created_at,
        updated_at,
        studio:studios (
          id,
          title,
          studio_images (image_url, is_cover)
        ),
        booking:bookings (
          id,
          booking_number,
          start_datetime
        ),
        conversation_participants (
          user_id,
          last_read_at,
          user:users (
            id,
            full_name,
            avatar_url
          )
        ),
        messages (
          id,
          content,
          sender_id,
          created_at,
          is_read
        )
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false })
      .limit(50)

    if (error) throw error

    // Process conversations to add computed fields
    const processedConversations = conversations?.map(conv => {
      const participants = conv.conversation_participants || []
      const otherParticipant = participants.find((p: any) => p.user_id !== user.id)
      const myParticipation = participations.find(p => p.conversation_id === conv.id)

      // Get last message
      const messages = conv.messages || []
      const lastMessage = messages.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      // Count unread messages
      const unreadCount = messages.filter((m: any) =>
        m.sender_id !== user.id &&
        !m.is_read &&
        (!myParticipation?.last_read_at || new Date(m.created_at) > new Date(myParticipation.last_read_at))
      ).length

      return {
        id: conv.id,
        studio: conv.studio,
        booking: conv.booking,
        other_participant: otherParticipant?.user,
        last_message: lastMessage ? {
          content: lastMessage.content,
          sender_id: lastMessage.sender_id,
          created_at: lastMessage.created_at,
        } : null,
        unread_count: unreadCount,
        updated_at: conv.updated_at,
      }
    })

    return NextResponse.json({ conversations: processedConversations })
  } catch (error: any) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { recipient_id, studio_id, booking_id, initial_message } = body

    if (!recipient_id) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      )
    }

    // Use the helper function to get or create conversation
    const { data: conversationId, error: rpcError } = await supabase.rpc(
      "get_or_create_conversation",
      {
        p_user1_id: user.id,
        p_user2_id: recipient_id,
        p_studio_id: studio_id || null,
        p_booking_id: booking_id || null,
      }
    )

    if (rpcError) throw rpcError

    // Send initial message if provided
    if (initial_message) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: initial_message,
      })

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
    }

    return NextResponse.json({ conversation_id: conversationId })
  } catch (error: any) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create conversation" },
      { status: 500 }
    )
  }
}
