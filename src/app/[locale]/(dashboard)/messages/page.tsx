import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "./messages-client"
import { getTranslations } from "next-intl/server"

interface ConversationRelation {
  id: string
  updated_at: string
  studio: { id: string; title: string; images?: string[]; studio_images?: { url: string }[] } | null
  booking: { id: string; booking_number?: string; start_date?: string; end_date?: string; status: string; total_price?: number } | null
}

interface MessageRecord {
  id: string
  conversation_id: string
  content: string
  created_at: string
  sender_id: string
}

export async function generateMetadata() {
  const t = await getTranslations("Messages")
  return { title: t("metaTitle") }
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ studio?: string; host?: string }>
}) {
  const { studio: studioId, host: hostId } = await searchParams
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
        booking:bookings (id, booking_number, start_date, end_date, status, total_price)
      )
    `)
    .eq("user_id", user.id)
    .order("conversation(updated_at)", { ascending: false })

  const conversationIds = (participations || []).map((p) => p.conversation_id)

  // Bulk fetch participants + messages in parallel
  const [{ data: allOtherParticipants }, { data: allMessages }] = conversationIds.length > 0
    ? await Promise.all([
        supabase
          .from("conversation_participants")
          .select(`
            conversation_id,
            user:users (id, full_name, avatar_url)
          `)
          .in("conversation_id", conversationIds)
          .neq("user_id", user.id),
        supabase
          .from("messages")
          .select("*")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }]

  // Combine results in-memory
  const conversationsWithDetails = (participations || []).map((p) => {
    const otherParticipant = (allOtherParticipants || []).find(
      (op) => op.conversation_id === p.conversation_id
    )

    const messages = (allMessages || []).filter(
      (m: MessageRecord) => m.conversation_id === p.conversation_id
    )

    // Get latest message from the already-fetched messages
    const latestMessage = messages.length > 0
      ? messages[messages.length - 1]
      : null

    // Count unread messages in-memory
    const unreadCount = messages.filter(
      (m: MessageRecord) =>
        m.sender_id !== user.id &&
        m.created_at > (p.last_read_at || "1970-01-01")
    ).length

    return {
      id: p.conversation_id,
      otherUser: otherParticipant?.user,
      studio: (p.conversation as unknown as ConversationRelation)?.studio,
      booking: (p.conversation as unknown as ConversationRelation)?.booking,
      latestMessage: latestMessage
        ? { content: latestMessage.content, created_at: latestMessage.created_at, sender_id: latestMessage.sender_id }
        : null,
      messages: messages || [],
      unreadCount,
    }
  })

  return (
    <MessagesClient
      conversations={conversationsWithDetails as React.ComponentProps<typeof MessagesClient>["conversations"]}
      currentUserId={user.id}
      preselectedStudioId={studioId}
      preselectedHostId={hostId}
    />
  )
}
