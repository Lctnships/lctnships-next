import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessagesClient } from "./messages-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Messages")
  return { title: t("metaTitle") }
}

// Mock conversations for when database is empty
const mockConversations = [
  {
    id: "conv-1",
    otherUser: {
      id: "user-1",
      full_name: "Industrial Loft NYC",
      avatar_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200",
      is_online: true,
    },
    studio: {
      id: "studio-1",
      title: "Industrial Loft NYC",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    booking: {
      id: "booking-1",
      date: "Oct 12, 2023",
      time: "09:00 AM - 06:00 PM",
      status: "confirmed",
      total: 1200,
    },
    latestMessage: {
      content: "The lighting setup is ready for your shoot. We've also included a complimentary coffee station for your team.",
      created_at: new Date().toISOString(),
      sender_id: "user-1",
      is_read: false,
    },
    unreadCount: 1,
    messages: [
      {
        id: "msg-1",
        content: "Hi there! We received your booking for the Industrial Loft on the 12th. Is there any specific equipment you need us to have ready?",
        created_at: "2023-10-11T09:12:00Z",
        sender_id: "user-1",
      },
      {
        id: "msg-2",
        content: "Hello! Yes, thank you for reaching out. We'll need the Godox AD600 kit and the heavy-duty C-stands. Do you have extra sandbags?",
        created_at: "2023-10-11T09:45:00Z",
        sender_id: "current-user",
      },
      {
        id: "msg-3",
        content: "Of course! We have 10 sandbags ready for you. Here is the setup from our last shoot for reference:",
        created_at: "2023-10-11T10:45:00Z",
        sender_id: "user-1",
        attachment: {
          type: "image",
          url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600",
          name: "studio_setup.jpg",
        },
      },
      {
        id: "msg-4",
        content: "The lighting setup is ready for your shoot. We've also included a complimentary coffee station for your team.",
        created_at: new Date().toISOString(),
        sender_id: "user-1",
      },
    ],
  },
  {
    id: "conv-2",
    otherUser: {
      id: "user-2",
      full_name: "Mid-Century Modern",
      avatar_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200",
      is_online: false,
    },
    studio: {
      id: "studio-2",
      title: "Mid-Century Modern Studio",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400",
    },
    booking: null,
    latestMessage: {
      content: "Great, see you on Tuesday at 9...",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sender_id: "user-2",
      is_read: true,
    },
    unreadCount: 0,
    messages: [],
  },
  {
    id: "conv-3",
    otherUser: {
      id: "user-3",
      full_name: "White Box Studio",
      avatar_url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200",
      is_online: false,
    },
    studio: {
      id: "studio-3",
      title: "White Box Studio",
      image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400",
    },
    booking: null,
    latestMessage: {
      content: "Can we reschedule for later?",
      created_at: "2023-10-10T14:30:00Z",
      sender_id: "user-3",
      is_read: true,
    },
    unreadCount: 0,
    messages: [],
  },
  {
    id: "conv-4",
    otherUser: {
      id: "user-4",
      full_name: "Skyline Rooftop",
      avatar_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200",
      is_online: false,
    },
    studio: {
      id: "studio-4",
      title: "Skyline Rooftop Studio",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    },
    booking: null,
    latestMessage: {
      content: "Archive: Request completed",
      created_at: "2023-10-05T10:00:00Z",
      sender_id: "user-4",
      is_read: true,
    },
    unreadCount: 0,
    messages: [],
  },
]

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
        studio: (p.conversation as any)?.studio,
        booking: (p.conversation as any)?.booking,
        latestMessage,
        messages: messages || [],
        unreadCount: unreadCount || 0,
      }
    })
  )

  // Use mock data if no conversations
  const displayConversations = conversationsWithDetails.length > 0
    ? conversationsWithDetails
    : mockConversations

  return (
    <MessagesClient
      conversations={displayConversations as any}
      currentUserId={user.id}
      preselectedStudioId={studioId}
      preselectedHostId={hostId}
    />
  )
}
