import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "@/app/[locale]/(dashboard)/messages/messages-client"
import { getTranslations } from "next-intl/server"

interface ConversationRelation {
  id: string
  updated_at: string
  studio: { id: string; title: string; images?: string[]; studio_images?: { image_url: string }[] } | null
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

export default async function HostMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ studio?: string; host?: string }>
}) {
  const { studio: studioId, host: hostId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: participations } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      last_read_at,
      conversation:conversations (
        id,
        updated_at,
        studio:studios (id, title, images, studio_images(image_url)),
        booking:bookings (id, booking_number, start_date, end_date, status, total_price)
      )
    `)
    .eq("user_id", user.id)
    .order("conversation(updated_at)", { ascending: false })
    .limit(50)

  const conversationIds = (participations || []).map((p) => p.conversation_id)

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
          .select("id, conversation_id, content, created_at, sender_id")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
          .limit(500),
      ])
    : [{ data: [] }, { data: [] }]

  const participantByConversation = new Map<string, typeof allOtherParticipants extends (infer U)[] | null ? U : never>()
  for (const op of allOtherParticipants || []) {
    if (!participantByConversation.has(op.conversation_id)) {
      participantByConversation.set(op.conversation_id, op as never)
    }
  }

  const messagesByConversation = new Map<string, MessageRecord[]>()
  for (const m of (allMessages || []) as MessageRecord[]) {
    const arr = messagesByConversation.get(m.conversation_id)
    if (arr) arr.push(m)
    else messagesByConversation.set(m.conversation_id, [m])
  }
  for (const arr of messagesByConversation.values()) arr.reverse()

  const conversationsWithDetails = (participations || []).map((p) => {
    const otherParticipant = participantByConversation.get(p.conversation_id) as
      | { user?: { id: string; full_name: string; avatar_url: string | null } }
      | undefined
    const messages = messagesByConversation.get(p.conversation_id) || []

    const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null
    const lastReadAt = p.last_read_at || "1970-01-01"
    let unreadCount = 0
    for (const m of messages) {
      if (m.sender_id !== user.id && m.created_at > lastReadAt) unreadCount++
    }

    return {
      id: p.conversation_id,
      otherUser: otherParticipant?.user,
      studio: (p.conversation as unknown as ConversationRelation)?.studio,
      booking: (p.conversation as unknown as ConversationRelation)?.booking,
      latestMessage: latestMessage
        ? { content: latestMessage.content, created_at: latestMessage.created_at, sender_id: latestMessage.sender_id }
        : null,
      messages,
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
