-- ============================================================================
-- 013_missing_rls_policies.sql
-- Phase C of the 2026-04-11 security audit: tables with RLS enabled but zero
-- policies. Without any policy, the user-scoped supabase client silently
-- returns empty results instead of erroring — this was the root cause of
-- the dashboard projects feature rendering empty lists in production.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- payment_methods — user owns their own payment methods
-- ----------------------------------------------------------------------------

CREATE POLICY "Users manage own payment methods"
  ON public.payment_methods
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- studio_availability — follows studio ownership
-- Readable by anyone (so renters can check availability on studio pages),
-- writable only by the host who owns the studio.
-- ----------------------------------------------------------------------------

CREATE POLICY "Anyone can read studio availability"
  ON public.studio_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Hosts manage own studio availability"
  ON public.studio_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studios
      WHERE studios.id = studio_availability.studio_id
      AND studios.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.studios
      WHERE studios.id = studio_availability.studio_id
      AND studios.host_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- project_* sub-tables — all linked via project_id to projects.owner_id.
-- These are personal production-planning tables; only the project owner has
-- access. project_members is an extension table where a project can have
-- collaborators, but without a working owner policy it was inaccessible.
-- ----------------------------------------------------------------------------

-- Shared helper: "is current user the owner of this project?"
-- Inlined per-table because CREATE POLICY cannot reference a function that
-- takes a column parameter cleanly; an EXISTS subquery is the canonical form.

CREATE POLICY "Owners manage project files"
  ON public.project_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage project locations"
  ON public.project_locations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_locations.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_locations.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage project moodboard items"
  ON public.project_moodboard_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_moodboard_items.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_moodboard_items.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage project notes"
  ON public.project_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_notes.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_notes.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage project shotlist"
  ON public.project_shotlist
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_shotlist.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_shotlist.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners manage project storyboards"
  ON public.project_storyboards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_storyboards.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_storyboards.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- project_members: owner can manage all rows, and a member can see rows
-- that reference them (so they can see their own membership).
CREATE POLICY "Owners manage project members"
  ON public.project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members see own membership"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
