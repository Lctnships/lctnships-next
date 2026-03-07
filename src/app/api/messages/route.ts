import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/messages - Send a message
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id, content } = body

    if (!conversation_id || !content) {
      return NextResponse.json(
        { error: "Conversation ID and content are required" },
        { status: 400 }
      )
    }

    // Verify user is a participant
    const { data: participation } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversation_id)
      .eq("user_id", user.id)
      .single()

    if (!participation) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      )
    }

    // Create message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
      })
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
      .single()

    if (error) throw error

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation_id)

    // Get other participant to notify
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversation_id)
      .neq("user_id", user.id)

    // Get sender name for notification
    const { data: sender } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single()

    // Create notification for other participants
    if (participants) {
      for (const participant of participants) {
        await supabase.rpc("create_notification", {
          p_user_id: participant.user_id,
          p_type: "new_message",
          p_title: "New Message",
          p_message: `${sender?.full_name || "Someone"} sent you a message`,
          p_link: `/messages?conversation=${conversation_id}`,
        })
      }
    }

    return NextResponse.json({ message })
  } catch (error: unknown) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

// GET /api/messages - Get unread message count
export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get conversations where user is a participant
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id)

    if (!participations || participations.length === 0) {
      return NextResponse.json({ unread_count: 0 })
    }

    const conversationIds = participations.map(p => p.conversation_id)

    // Count unread messages
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id)
      .eq("is_read", false)

    if (error) throw error

    return NextResponse.json({ unread_count: count || 0 })
  } catch (error: unknown) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    )
  }
}
