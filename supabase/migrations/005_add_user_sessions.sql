-- User sessions table for tracking logged-in devices
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT,
    device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('laptop', 'phone', 'desktop', 'tablet')),
    browser TEXT,
    os TEXT,
    ip_address INET,
    location TEXT,
    user_agent TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- RLS policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout other devices)
CREATE POLICY "Users can delete own sessions"
    ON public.user_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Allow insert via service role or authenticated users for their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.user_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow update for own sessions (e.g. last_active_at)
CREATE POLICY "Users can update own sessions"
    ON public.user_sessions FOR UPDATE
    USING (auth.uid() = user_id);
