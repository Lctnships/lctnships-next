"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface Attachment {
  type: "image" | "file"
  url: string
  name: string
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  attachment?: Attachment
}

interface Booking {
  id: string
  date?: string
  booking_number?: string
  start_date?: string
  end_date?: string
  time?: string
  status: string
  total?: number
  total_price?: number
}

interface Studio {
  id: string
  title: string
  image?: string
  images?: string[]
  studio_images?: { url: string }[]
}

interface OtherUser {
  id: string
  full_name: string
  avatar_url?: string
  is_online?: boolean
}

interface Conversation {
  id: string
  otherUser: OtherUser
  studio?: Studio
  booking?: Booking | null
  latestMessage?: {
    content: string
    created_at: string
    sender_id: string
    is_read?: boolean
  }
  messages: Message[]
  unreadCount: number
}

interface MessagesClientProps {
  conversations: Conversation[]
  currentUserId: string
}

export function MessagesClient({ conversations, currentUserId }: MessagesClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations[0] || null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  // Receive new messages live via Supabase Realtime
  useEffect(() => {
    const conversationId = selectedConversation?.id
    if (!conversationId) return

    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    const subscribe = async () => {
      // Realtime enforces RLS per subscriber: join with the user's JWT,
      // not the anon key, or events for this conversation never arrive.
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) await supabase.realtime.setAuth(session.access_token)
      if (cancelled) return

      channel = supabase
        .channel(`conv-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const msg = payload.new as Message & { conversation_id: string }
            // Own messages are already added optimistically on send
            if (msg.sender_id === currentUserId) return
            setSelectedConversation((prev) =>
              prev && prev.id === msg.conversation_id
                ? { ...prev, messages: [...prev.messages, msg] }
                : prev
            )
          }
        )
        .subscribe()
    }

    subscribe()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id, currentUserId])

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })
      if (error) throw error

      // Optimistically add message to UI
      const newMsg: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender_id: currentUserId,
      }

      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMsg],
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const getStudioImage = (studio?: Studio) => {
    if (!studio) return ""
    return studio.image || studio.images?.[0] || studio.studio_images?.[0]?.url || ""
  }

  const getBookingTotal = (booking?: Booking | null) => {
    if (!booking) return 0
    return booking.total || booking.total_price || 0
  }

  const getBookingDate = (booking?: Booking | null) => {
    if (!booking) return ""
    return booking.date || booking.start_date || ""
  }

  return (
    <div className="h-[calc(100vh-120px)] flex bg-gray-50 rounded-3xl overflow-hidden border border-gray-200">
      {/* Conversations List - Left Sidebar */}
      <aside
        className={`w-full md:w-[360px] bg-white border-r border-gray-100 flex flex-col ${
          showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">chat_bubble</span>
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv)
                  setShowMobileChat(true)
                }}
                className={`w-full p-4 flex gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                  selectedConversation?.id === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="size-14 rounded-full bg-cover bg-center bg-gray-200"
                    style={
                      conv.otherUser.avatar_url
                        ? { backgroundImage: `url("${conv.otherUser.avatar_url}")` }
                        : {}
                    }
                  >
                    {!conv.otherUser.avatar_url && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-gray-400">person</span>
                      </div>
                    )}
                  </div>
                  {conv.otherUser.is_online && (
                    <span className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold truncate">{conv.otherUser.full_name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {conv.latestMessage ? formatTime(conv.latestMessage.created_at) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.latestMessage?.content || "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center size-5 bg-primary text-white text-xs font-bold rounded-full mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area - Center */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          !showMobileChat ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-4">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="relative">
                <div
                  className="size-12 rounded-full bg-cover bg-center bg-gray-200"
                  style={
                    selectedConversation.otherUser.avatar_url
                      ? { backgroundImage: `url("${selectedConversation.otherUser.avatar_url}")` }
                      : {}
                  }
                >
                  {!selectedConversation.otherUser.avatar_url && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-gray-400">person</span>
                    </div>
                  )}
                </div>
                {selectedConversation.otherUser.is_online && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{selectedConversation.otherUser.full_name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.otherUser.is_online ? "Online" : "Offline"}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedConversation.messages.map((message) => {
                const isOwn = message.sender_id === currentUserId || message.sender_id === "current-user"
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isOwn
                          ? "bg-primary text-white rounded-3xl rounded-br-lg"
                          : "bg-gray-100 rounded-3xl rounded-bl-lg"
                      } p-4`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.attachment && message.attachment.type === "image" && (
                        <div className="mt-3 rounded-2xl overflow-hidden">
                          <Image
                            src={message.attachment.url}
                            alt={message.attachment.name}
                            width={300}
                            height={200}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <span className="material-symbols-outlined">image</span>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-4">forum</span>
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose from your existing conversations</p>
          </div>
        )}
      </div>

      {/* Booking Details - Right Sidebar */}
      {selectedConversation?.booking && (
        <aside className="hidden lg:block w-[320px] bg-gray-50 border-l border-gray-100 p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
            Booking Details
          </h3>

          {/* Studio Preview */}
          {selectedConversation.studio && (
            <div className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm">
              <div
                className="h-32 bg-cover bg-center bg-gray-200"
                style={{ backgroundImage: `url("${getStudioImage(selectedConversation.studio)}")` }}
              />
              <div className="p-4">
                <h4 className="font-bold mb-1">{selectedConversation.studio.title}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-primary text-base">star</span>
                  <span>5.0</span>
                  <span className="mx-1">·</span>
                  <span>24 reviews</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedConversation.booking.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : selectedConversation.booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedConversation.booking.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Date</span>
              <span className="font-medium text-sm">
                {getBookingDate(selectedConversation.booking)}
              </span>
            </div>
            {selectedConversation.booking.time && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Time</span>
                <span className="font-medium text-sm">{selectedConversation.booking.time}</span>
              </div>
            )}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">
                  €{getBookingTotal(selectedConversation.booking)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <button className="w-full py-3 px-4 bg-white rounded-full font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200">
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              View Booking
            </button>
            <button className="w-full py-3 px-4 bg-white rounded-full font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              Get Help
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
