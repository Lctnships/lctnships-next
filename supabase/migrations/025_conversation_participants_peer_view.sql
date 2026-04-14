-- Migration 025 — let participants see each other's rows
-- The existing "Users can view own participations" policy restricts SELECT to
-- user_id = auth.uid(), which means the messages page can never resolve the
-- other participant's name/avatar — the UI shows every conversation as
-- "undefined" and crashes when it dereferences otherUser.full_name.
--
-- A naive `EXISTS (SELECT 1 FROM conversation_participants ...)` policy would
-- recurse on itself. We use a SECURITY DEFINER helper that bypasses RLS for
-- the participation check.

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated;

CREATE POLICY "Participants can view peer rows"
  ON public.conversation_participants
  FOR SELECT
  USING (public.is_conversation_participant(conversation_id, auth.uid()));
