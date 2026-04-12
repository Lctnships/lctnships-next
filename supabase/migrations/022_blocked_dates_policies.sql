-- ============================================================================
-- 022_blocked_dates_policies.sql
-- CRITICAL fix from RLS audit: studio_blocked_dates had RLS enabled with
-- zero policies since migration 001. Every user-scoped INSERT/DELETE
-- silently returned 0 rows, so:
--   - Calendar blocked dates added by hosts via the UI never persisted
--   - iCal import (Wix/MeetingPackage) appeared to succeed but wrote nothing
--   - Double-bookings on blocked slots were possible
-- ============================================================================

-- Public SELECT so renters can see which dates are blocked when booking
CREATE POLICY "Blocked dates are publicly readable"
  ON public.studio_blocked_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hosts can INSERT/UPDATE/DELETE blocked dates for their own studios
CREATE POLICY "Hosts manage own blocked dates"
  ON public.studio_blocked_dates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studios s
      WHERE s.id = studio_blocked_dates.studio_id
      AND s.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.studios s
      WHERE s.id = studio_blocked_dates.studio_id
      AND s.host_id = auth.uid()
    )
  );
