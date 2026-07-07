import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "./messages-client"

export const metadata = {
  title: "Berichten",
}

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get conversations for this user
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      last_read_at,
      conversation:conversations (
        id,
        updated_at,
        studio:studios (id, title, images, studio_images(*)),
        booking:bookings (id, booking_number, start_date:start_datetime, end_date:end_datetime, status, total_price)
      )
    `)
    .eq("user_id", user.id)
    .order("conversation(updated_at)", { ascending: false })

  // Get the latest message and other participant for each conversation
  const conversationsWithDetails = await Promise.all(
    (participations || []).map(async (p) => {
      // Get other participant
      const { data: otherParticipant } = await supabase
        .from("conversation_participants")
        .select(`
          user:users (id, full_name, avatar_url)
        `)
        .eq("conversation_id", p.conversation_id)
        .neq("user_id", user.id)
        .single()

      // Get latest message
      const { data: latestMessage } = await supabase
        .from("messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", p.conversation_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Get all messages for this conversation
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", p.conversation_id)
        .order("created_at", { ascending: true })

      // Count unread messages
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", p.conversation_id)
        .neq("sender_id", user.id)
        .gt("created_at", p.last_read_at || "1970-01-01")

      return {
        id: p.conversation_id,
        otherUser: otherParticipant?.user,
        studio: p.conversation?.studio,
        booking: p.conversation?.booking,
        latestMessage,
        messages: messages || [],
        unreadCount: unreadCount || 0,
      }
    })
  )

  return (
    <MessagesClient
      conversations={conversationsWithDetails as any}
      currentUserId={user.id}
    />
  )
}
