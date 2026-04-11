-- ============================================================================
-- 018_users_authenticated_column_revoke.sql
-- Phase D (final) of the 2026-04-11 security audit closeout.
--
-- Migration 011 blocked anonymous callers from harvesting sensitive user
-- columns (phone, stripe_account_id, bank_*, etc.) via PostgREST. But the
-- authenticated role could still read any of those columns for ANY row
-- because the "Authenticated users read profiles" policy uses USING(true).
-- The threat: a logged-in user hitting
--   GET /rest/v1/users?select=stripe_account_id,bank_iban
-- returns every row. Not as bad as anonymous, but still a PII harvest.
--
-- Phase A left this open because 12 server files needed to be migrated
-- from the user-scoped client to the admin client first — without those
-- migrations, revoking the columns would break legitimate own-user reads
-- (settings page, bank details, Stripe connect flow). Those migrations
-- landed in this same commit batch. Now we can finish the job.
--
-- Result: authenticated can SELECT only the safe public profile fields
-- (id, full_name, avatar_url, bio, location, user_type, is_verified,
-- created_at, updated_at). Sensitive fields are admin-client-only.
-- ============================================================================

-- Drop the blanket table grant and re-grant only the safe columns.
-- PostgreSQL column-level REVOKEs are ineffective when a table-level grant
-- exists (it always wins), so we must remove the table grant first.
REVOKE SELECT ON public.users FROM authenticated;

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
) ON public.users TO authenticated;

-- Same treatment for INSERT/UPDATE — migration 011 partially handled this
-- via policies, but the column grants need to match so mass-assignment via
-- direct PostgREST patches can't touch sensitive fields. We revoke and
-- re-grant only safe editable columns.
REVOKE UPDATE ON public.users FROM authenticated;

GRANT UPDATE (
  full_name,
  avatar_url,
  bio,
  location,
  updated_at
) ON public.users TO authenticated;

-- INSERT stays allowed for the minimal signup shape (handled server-side
-- via admin client for sensitive fields). We revoke and re-grant the
-- safe columns so a direct REST insert cannot inject phone or stripe_*.
REVOKE INSERT ON public.users FROM authenticated;

GRANT INSERT (
  id,
  email,
  full_name,
  avatar_url,
  user_type,
  created_at,
  updated_at
) ON public.users TO authenticated;

-- DELETE remains fully blocked from authenticated — users can deactivate
-- via an API route that uses the admin client with soft-delete logic.
REVOKE DELETE ON public.users FROM authenticated;
