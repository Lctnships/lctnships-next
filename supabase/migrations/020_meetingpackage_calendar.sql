-- Add MeetingPackage calendar URL column to studios
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS meetingpackage_calendar_url TEXT;