-- ============================================================================
-- 011_security_hardening_p0.sql
-- Fixes CRITICAL findings from the 2026-04-11 security audit.
-- Phase A of 3 — targets the exploitable P0 issues. Phase B/C will follow.
-- Policy names in this file match the production Supabase state, which
-- differs from the local migrations/001_initial_schema.sql file because
-- schema history on the remote was built up incrementally in dashboard.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- C1: Restrict credits policies to service_role
-- Before: "Service can manage credits" applied TO PUBLIC with USING(true),
-- so any authenticated user could PATCH /rest/v1/user_credits and grant
-- themselves unlimited credits. Same for credit_transactions INSERT.
-- (The `transactions` table has no open policy on prod — nothing to do there.)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service can manage credits" ON public.user_credits;
CREATE POLICY "Service role manages credits"
  ON public.user_credits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert transactions" ON public.credit_transactions;
CREATE POLICY "Service role inserts credit transactions"
  ON public.credit_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- C2: Block anonymous harvest of sensitive user columns
-- Before: "Users can view all profiles" USING(true) let any unauthenticated
-- request SELECT stripe_account_id, phone, bank_iban, etc. across every row.
--
-- Phase A fix: column-level grants on the anon role. Phase B will tighten
-- authenticated access after migrating the 9 server files that currently
-- read sensitive columns via the user-scoped client.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

CREATE POLICY "Authenticated users read profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users read public profiles"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- Revoke default SELECT from anon, then re-grant only safe public columns.
-- Anonymous PostgREST requests that try to select phone/stripe/bank_* will
-- now be rejected by PostgreSQL with a permission-denied error before RLS
-- is evaluated. Service role is unaffected.
REVOKE SELECT ON public.users FROM anon;
GRANT SELECT (
  id,
  full_name,
  avatar_url,
  bio,
  location,
  user_type,
  is_verified,
  created_at,
  updated_at
) ON public.users TO anon;

-- ----------------------------------------------------------------------------
-- C3: Block financial column mutation on bookings via direct PostgREST
-- Before: both "Users can update their own bookings" and "Hosts can update
-- bookings for their studios" had USING but no WITH CHECK. A PATCH like
--   PATCH /rest/v1/bookings?id=eq.<my_booking> {"total_amount": 0.01}
-- would commit because USING only gates which rows can be touched, not what
-- values are allowed after the update. Column-level REVOKE additionally
-- blocks any mutation of financial fields even with RLS passing.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can update bookings for their studios" ON public.bookings;

CREATE POLICY "Hosts can update own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Renters can update own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revoke ALL UPDATE on bookings, then grant back only the operational columns
-- authenticated users legitimately need to touch. Column-level REVOKE does NOT
-- work in PostgreSQL when the role already has a table-level GRANT — the table
-- grant overrides individual column revokes. So we drop the table grant and
-- re-grant selectively. Service role is unaffected.
REVOKE UPDATE ON public.bookings FROM anon, authenticated;
GRANT UPDATE (
  status,
  notes,
  special_requests,
  production_type,
  cancellation_reason,
  cancelled_by,
  cancelled_at,
  start_datetime,
  end_datetime,
  total_hours,
  start_time,
  end_time,
  updated_at
) ON public.bookings TO authenticated;

-- ----------------------------------------------------------------------------
-- C5: Webhook idempotency table
-- Stripe delivers events at-least-once; on retry we must skip already-
-- processed events to prevent duplicate credit grants and duplicate
-- transaction rows. The webhook handler inserts a row with event.id as PK
-- before processing; a unique violation means the event is a retry.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook events"
  ON public.processed_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_processed_at
  ON public.processed_webhook_events (processed_at);
