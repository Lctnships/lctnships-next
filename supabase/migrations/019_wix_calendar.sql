-- Add Wix calendar URL column to studios
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS wix_calendar_url TEXT;