-- ============================================================================
-- 014_booking_blocks.sql
-- Custom Booking Duration: Add booking_mode and booking_blocks to studios table
-- Existing studios automatically get 'flexible' mode (current behavior)
-- ============================================================================

-- Add booking_mode column with default 'flexible'
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS booking_mode TEXT NOT NULL DEFAULT 'flexible'
CHECK (booking_mode IN ('flexible', 'fixed_blocks'));

-- Add booking_blocks JSONB column for fixed block mode
-- Structure: [{"duration_hours": 2, "price": 100, "sort_order": 0}, ...]
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS booking_blocks JSONB DEFAULT '[]'::jsonb;

-- Set explicit default for existing rows (already 'flexible' by default, but explicit is clearer)
UPDATE public.studios SET booking_mode = 'flexible' WHERE booking_mode IS NULL;

-- Ensure the check constraint applies to existing data
ALTER TABLE public.studios
DROP CONSTRAINT IF EXISTS studios_booking_mode_check;

ALTER TABLE public.studios
ADD CONSTRAINT studios_booking_mode_check
CHECK (booking_mode IN ('flexible', 'fixed_blocks'));

-- Add index for efficient querying by booking mode
CREATE INDEX IF NOT EXISTS idx_studios_booking_mode ON public.studios(booking_mode) WHERE booking_mode = 'fixed_blocks';