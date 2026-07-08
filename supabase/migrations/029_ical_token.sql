-- Per-studio iCal token so external calendar apps (Google, Outlook, Apple)
-- can subscribe to the studio's feed without a logged-in session. The
-- /api/calendar/ical/[studioId] route accepts ?token=<ical_token> as an
-- alternative to owner auth; without this column that path always 401'd and
-- calendar subscriptions never worked.

ALTER TABLE public.studios
  ADD COLUMN IF NOT EXISTS ical_token text
  DEFAULT replace(gen_random_uuid()::text, '-', '');

-- Backfill any existing rows created before the default existed.
UPDATE public.studios
SET ical_token = replace(gen_random_uuid()::text, '-', '')
WHERE ical_token IS NULL;
