-- Indexes that back the dashboard messaging + favorites queries.
-- These match the WHERE + ORDER BY patterns in:
--   src/app/[locale]/(dashboard)/messages/page.tsx
--   src/app/[locale]/(host)/host/messages/page.tsx
--   src/app/[locale]/(dashboard)/favorites/page.tsx
--   src/app/[locale]/(dashboard)/bookings/page.tsx

-- Conversation participants lookup by user (main filter on messages pages)
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
  ON public.conversation_participants (user_id);

-- Bulk .in("conversation_id", ...).neq("user_id", ...) on the other side
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_user
  ON public.conversation_participants (conversation_id, user_id);

-- Messages bulk fetch by conversation ordered DESC on created_at
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_desc
  ON public.messages (conversation_id, created_at DESC);

-- Favorites list by user, ordered by most recent first
CREATE INDEX IF NOT EXISTS idx_favorites_user_created_desc
  ON public.favorites (user_id, created_at DESC);

-- Renter bookings list (no status filter) ordered by start_datetime DESC.
-- The existing idx_bookings_renter_status_start works for status-filtered
-- queries, but the bookings page lists all statuses — this index covers it.
CREATE INDEX IF NOT EXISTS idx_bookings_renter_start_desc
  ON public.bookings (renter_id, start_datetime DESC);
