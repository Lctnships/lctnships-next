-- Migration 009: Tighten RLS policies for conversations and notifications
-- Fixes OWASP findings M-01 and M-02

-- ============================================
-- M-01: Conversations — require auth.uid() to be a participant
-- ============================================

-- Drop the overly permissive INSERT policy on conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- New policy: user must be referenced as a participant via the
-- get_or_create_conversation() RPC, or we trust that the insert is
-- immediately followed by adding the creator as a participant.
-- We enforce this by requiring the inserting user to also add themselves
-- as a participant (see conversation_participants policy below).
-- For direct inserts we cannot check participants yet (chicken-and-egg),
-- so we rely on the conversation_participants INSERT policy instead.
-- The safest approach: only allow inserts via the SECURITY DEFINER RPC.
-- Revoke direct INSERT from authenticated and re-create the RPC as SECURITY DEFINER.

REVOKE INSERT ON public.conversations FROM authenticated;

-- Ensure the get_or_create_conversation function runs as SECURITY DEFINER
-- so it can insert into conversations even though authenticated role cannot.
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_user1_id UUID,
    p_user2_id UUID,
    p_studio_id UUID DEFAULT NULL,
    p_booking_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Verify the calling user is one of the participants
    IF auth.uid() IS NULL OR (auth.uid() != p_user1_id AND auth.uid() != p_user2_id) THEN
        RAISE EXCEPTION 'You must be a participant in the conversation';
    END IF;

    -- Check if conversation already exists between these users for this studio/booking
    SELECT c.id INTO conversation_id
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = p_user1_id
    JOIN public.conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = p_user2_id
    WHERE (c.studio_id = p_studio_id OR (c.studio_id IS NULL AND p_studio_id IS NULL))
    LIMIT 1;

    -- If no conversation exists, create one
    IF conversation_id IS NULL THEN
        INSERT INTO public.conversations (studio_id, booking_id)
        VALUES (p_studio_id, p_booking_id)
        RETURNING id INTO conversation_id;

        -- Add participants
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES
            (conversation_id, p_user1_id),
            (conversation_id, p_user2_id);
    END IF;

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the overly permissive INSERT policy on conversation_participants
DROP POLICY IF EXISTS "Users can insert conversation participants" ON public.conversation_participants;

-- New policy: users can only insert rows where user_id = their own uid
CREATE POLICY "Users can insert own participation" ON public.conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- M-02: Notifications — revoke direct INSERT from authenticated
-- ============================================

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Revoke INSERT privilege from authenticated role entirely
REVOKE INSERT ON public.notifications FROM authenticated;

-- Ensure create_notification() is SECURITY DEFINER so it can still insert
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
