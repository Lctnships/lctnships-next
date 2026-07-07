-- The deployed database predates parts of 001_initial_schema.sql: eight
-- studios columns from that migration never made it in (booking API broke on
-- studios.instant_book). Add them idempotently, definitions copied from 001.
-- studio_type: nullable here (001 has NOT NULL) — existing rows can't satisfy
-- a NOT NULL without a backfill value we'd be inventing.

ALTER TABLE public.studios
  ADD COLUMN IF NOT EXISTS studio_type TEXT CHECK (studio_type IN ('photo', 'video', 'podcast', 'music', 'dance', 'creative')),
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS min_booking_hours INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_guests INTEGER,
  ADD COLUMN IF NOT EXISTS square_meters INTEGER,
  ADD COLUMN IF NOT EXISTS instant_book BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- Note: instant_book defaults to FALSE (request-to-book) instead of 001's
-- TRUE — hosts must opt in to instant booking; safer default for a
-- marketplace where confirmation implies commitment.
