-- ============================================================================
-- 021_booking_lead_time.sql
-- Add a per-studio minimum-notice setting so hosts can prevent last-minute
-- bookings. Stored in hours (integer). 0 means "no minimum", the default.
--
-- Used by /api/bookings POST to reject bookings where
--   start_datetime - now() < booking_lead_time_hours
-- and by the renter session-details UI to disable time slots that would
-- violate the lead time.
-- ============================================================================

ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS booking_lead_time_hours INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.studios.booking_lead_time_hours IS
  'Minimum number of hours between "now" and a requested booking start_datetime. 0 disables the check.';
