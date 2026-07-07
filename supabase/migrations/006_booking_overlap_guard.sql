-- Double-booking protection.
-- 1) Hard guarantee: exclusion constraint rejects two confirmed bookings on
--    the same studio with overlapping time ranges, race-free at the DB level.
-- 2) booking_slot_taken(): SECURITY DEFINER helper so the API can check for
--    conflicts before insert/confirm. RLS hides other renters' bookings from
--    the caller, so a plain SELECT would always see zero conflicts.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_confirmed_overlap
  EXCLUDE USING gist (
    studio_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  )
  WHERE (status = 'confirmed');

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
      AND status = 'confirmed'
      AND (p_exclude_booking IS NULL OR id <> p_exclude_booking)
      AND start_datetime < p_end
      AND end_datetime > p_start
  );
$$;

GRANT EXECUTE ON FUNCTION public.booking_slot_taken TO authenticated, anon, service_role;
