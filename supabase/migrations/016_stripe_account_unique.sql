-- ============================================================================
-- 016_stripe_account_unique.sql
-- L2 from the 2026-04-11 security audit closeout.
--
-- Before: create-connect-account/route.ts checked profile.stripe_account_id,
-- then called stripe.accounts.create(), then wrote the new account id back.
-- Two concurrent requests from the same user (double-click, network retry)
-- both saw NULL at the read, both created a new Stripe account, and only the
-- last DB write won — leaving the first account orphaned in Stripe, unable
-- to receive payouts and cluttering the platform account list.
--
-- This migration adds a UNIQUE constraint on users.stripe_account_id so the
-- database itself rejects duplicate linkages. Combined with a conditional
-- UPDATE in the route (UPDATE ... WHERE stripe_account_id IS NULL) this
-- becomes atomic: whichever request commits first wins, the second gets an
-- empty RETURNING and cleans up its orphan account.
-- ============================================================================

-- NULL values are considered distinct by PostgreSQL UNIQUE constraints, so
-- users who haven't set up Connect yet are unaffected. Only non-null values
-- are enforced unique.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_account_id_unique
  ON public.users (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;
