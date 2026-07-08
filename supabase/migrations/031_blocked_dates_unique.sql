-- The calendar-import route upserts blocked dates with
-- onConflict: "studio_id,blocked_date", but no matching unique constraint
-- existed — so every import (Wix/MeetingPackage) threw "no unique or
-- exclusion constraint matching the ON CONFLICT specification" and imported
-- nothing. Add the unique constraint the upsert relies on.
-- De-dupe first in case any duplicates exist.

DELETE FROM public.studio_blocked_dates a
USING public.studio_blocked_dates b
WHERE a.ctid < b.ctid
  AND a.studio_id = b.studio_id
  AND a.blocked_date = b.blocked_date;

ALTER TABLE public.studio_blocked_dates
  DROP CONSTRAINT IF EXISTS studio_blocked_dates_studio_date_key;

ALTER TABLE public.studio_blocked_dates
  ADD CONSTRAINT studio_blocked_dates_studio_date_key
  UNIQUE (studio_id, blocked_date);
