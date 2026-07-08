-- Double-booking protection. The booking-create route had no overlap check,
-- so two renters could book (and pay for) the same studio + time slot.
-- 1) Exclusion constraint: race-free guarantee at the DB level that no two
--    confirmed/approved/pending bookings overlap on the same studio.
-- 2) booking_slot_taken(): SECURITY DEFINER helper the API calls before
--    insert/approve — RLS hides other renters' bookings from the caller, so a
--    plain SELECT would see zero conflicts.
--
-- "Blocking" statuses = anything that holds the slot: pending (instant, awaiting
-- payment), pending_approval, approved (awaiting payment), confirmed, completed.
-- Rejected / expired / cancelled do NOT hold the slot.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_slot_overlap;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_slot_overlap
  EXCLUDE USING gist (
    studio_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  )
  WHERE (status IN ('pending','pending_approval','approved','confirmed','completed'));

CREATE OR REPLACE FUNCTION public.booking_slot_taken(
  p_studio_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ,
  p_exclude_booking UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE studio_id = p_studio_id
      AND status IN ('pending','pending_approval','approved','confirmed','completed')
      AND (p_exclude_booking IS NULL OR id <> p_exclude_booking)
      AND start_datetime < p_end
      AND end_datetime > p_start
  );
$$;

GRANT EXECUTE ON FUNCTION public.booking_slot_taken TO authenticated, anon, service_role;
