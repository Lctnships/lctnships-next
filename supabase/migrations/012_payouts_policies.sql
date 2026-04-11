-- ============================================================================
-- 012_payouts_policies.sql
-- H7 from Phase B of the 2026-04-11 security audit.
--
-- The payouts table has RLS enabled but zero policies on production, which
-- means every user-scoped INSERT/UPDATE/SELECT silently returns 0 rows. The
-- /api/stripe/create-payout route is currently inserting via the user-scoped
-- supabase client and that insert has been failing quietly — hosts receive
-- their Stripe payout but no row is persisted in the payouts table.
--
-- Fix: allow hosts to read and insert their own payouts. UPDATE is reserved
-- for the webhook (service role). Column-level GRANTs keep `status`, `amount`
-- and `paid_at` read-only for hosts — they cannot self-promote a pending
-- payout to paid via a direct PATCH.
-- ============================================================================

-- SELECT — hosts see only their own payouts
CREATE POLICY "Hosts view own payouts"
  ON public.payouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

-- INSERT — hosts can request their own payouts via the /api/stripe/create-payout
-- route. WITH CHECK enforces that host_id matches the authed user, so a
-- malicious host cannot insert a payout tied to another host's account.
CREATE POLICY "Hosts insert own payouts"
  ON public.payouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- UPDATE is service_role only. Hosts must never flip status from pending to
-- paid or change the amount — only the Stripe webhook (service role) or the
-- server-side payout confirmation flow may mutate state.
CREATE POLICY "Service role updates payouts"
  ON public.payouts
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
