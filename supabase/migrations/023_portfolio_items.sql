-- ============================================================================
-- 023_portfolio_items.sql
-- Portfolio feature for creative professionals (renters). Lets users showcase
-- their work on their profile — photos/videos from past shoots, client work,
-- production stills. Hosts see this when reviewing booking requests.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_type TEXT, -- e.g. 'photoshoot', 'music_video', 'commercial', 'film'
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Anyone can see portfolio items (they're public profile content)
CREATE POLICY "Portfolio items are publicly readable"
  ON public.portfolio_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can manage their own portfolio
CREATE POLICY "Users manage own portfolio"
  ON public.portfolio_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_user
  ON public.portfolio_items (user_id, order_index);
