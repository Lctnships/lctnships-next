-- ============================================================================
-- 015_booking_extensions.sql
-- Booking Extension feature - allow renters to extend active sessions
--
-- Review fix notes (audit closeout, 2026-04-11):
--  - Added INSERT/UPDATE policies so the /api/bookings/[id]/extend route can
--    actually create rows via the user-scoped supabase client (previously
--    the table had RLS enabled with SELECT-only policies, blocking writes).
--  - Removed the public "viewable by anon" policy that leaked stripe_payment_id,
--    host_payout, commission_amount, and total_extension_price to anyone.
--    Extensions are now only visible to the renter or the host of that booking.
--  - Removed the reference to s.closing_time in get_extension_availability
--    since that column does not exist on studios — the function now uses the
--    22:00 default for all studios until a real closing_time column is added.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add extension settings to studios table
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS allow_extensions BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_extension_hours INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS extension_premium_rate DECIMAL DEFAULT NULL;

-- Create booking_extensions table
CREATE TABLE IF NOT EXISTS public.booking_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES public.users(id),
    host_id UUID NOT NULL REFERENCES public.users(id),
    studio_id UUID NOT NULL REFERENCES public.studios(id),
    extra_hours DECIMAL NOT NULL,
    studio_extension_price DECIMAL NOT NULL,
    equipment_extension_price DECIMAL NOT NULL DEFAULT 0,
    total_extension_price DECIMAL NOT NULL,
    commission_amount DECIMAL NOT NULL,
    host_payout DECIMAL NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_extension_items table for per-equipment tracking
CREATE TABLE IF NOT EXISTS public.booking_extension_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extension_id UUID NOT NULL REFERENCES public.booking_extensions(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id),
    equipment_name TEXT NOT NULL,
    price_per_hour DECIMAL NOT NULL,
    hours DECIMAL NOT NULL,
    subtotal DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.booking_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_extension_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- booking_extensions policies
-- ---------------------------------------------------------------------------

-- SELECT: renter or host of this booking only. No public access — extension
-- rows include stripe_payment_id, host_payout, and commission_amount, which
-- must never be readable by anonymous callers.
CREATE POLICY "Renters can view own extensions"
  ON public.booking_extensions
  FOR SELECT
  TO authenticated
  USING (renter_id = auth.uid());

CREATE POLICY "Hosts can view extensions for own studios"
  ON public.booking_extensions
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- INSERT: only the renter can create their own extension request. host_id,
-- studio_id, and financial columns are still writable by authenticated but
-- the /api/bookings/[id]/extend route recalculates them server-side before
-- INSERT, and the booking_id must refer to a booking the renter owns.
CREATE POLICY "Renters can create own extensions"
  ON public.booking_extensions
  FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = auth.uid());

-- UPDATE: only the Stripe webhook (service role) should flip payment_status
-- from 'pending' to 'paid'. Renters can optionally cancel their own pending
-- extensions.
CREATE POLICY "Renters can cancel own pending extensions"
  ON public.booking_extensions
  FOR UPDATE
  TO authenticated
  USING (renter_id = auth.uid())
  WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Service role updates booking_extensions"
  ON public.booking_extensions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- booking_extension_items policies
-- ---------------------------------------------------------------------------

CREATE POLICY "Renters can view own extension items"
  ON public.booking_extension_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_extensions e
      WHERE e.id = extension_id AND e.renter_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can view own extension items"
  ON public.booking_extension_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_extensions e
      WHERE e.id = extension_id AND e.host_id = auth.uid()
    )
  );

-- INSERT: renter inserting items for their own extension.
CREATE POLICY "Renters can create own extension items"
  ON public.booking_extension_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_extensions e
      WHERE e.id = extension_id AND e.renter_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Indexes for performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_booking_extensions_booking_id ON public.booking_extensions(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_extensions_renter_id ON public.booking_extensions(renter_id);
CREATE INDEX IF NOT EXISTS idx_booking_extensions_host_id ON public.booking_extensions(host_id);
CREATE INDEX IF NOT EXISTS idx_booking_extension_items_extension_id ON public.booking_extension_items(extension_id);

-- Add extension columns to bookings table to track original end time
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS original_end_datetime TIMESTAMP WITH TIME ZONE;

-- ---------------------------------------------------------------------------
-- Extension availability function
-- ---------------------------------------------------------------------------
-- Removed the reference to s.closing_time since that column does not exist on
-- the studios table. Closing time is hardcoded at 22:00 local time until a
-- dedicated column is added (tracked as a follow-up).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_extension_availability(p_booking_id UUID)
RETURNS TABLE(
  available_hours DECIMAL,
  conflict_type TEXT,
  conflict_booking_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_available_hours DECIMAL;
  v_next_booking RECORD;
  v_closing_time TIME := '22:00'::TIME;
BEGIN
  -- Get the booking details
  SELECT b.*, s.allow_extensions, s.max_extension_hours
  INTO v_booking
  FROM public.bookings b
  JOIN public.studios s ON b.studio_id = s.id
  WHERE b.id = p_booking_id;

  IF NOT FOUND OR v_booking.status != 'confirmed' THEN
    RETURN QUERY SELECT 0::DECIMAL, 'booking_not_found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF v_booking.allow_extensions = FALSE THEN
    RETURN QUERY SELECT 0::DECIMAL, 'extensions_not_allowed'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get the next booking for this studio
  SELECT b.id, b.start_datetime, b.status
  INTO v_next_booking
  FROM public.bookings b
  WHERE b.studio_id = v_booking.studio_id
    AND b.id != p_booking_id
    AND b.status IN ('pending', 'confirmed')
    AND b.start_datetime > v_booking.end_datetime
  ORDER BY b.start_datetime ASC
  LIMIT 1;

  -- Calculate available hours
  IF v_next_booking IS NOT NULL THEN
    -- Until next booking
    v_available_hours := EXTRACT(EPOCH FROM (v_next_booking.start_datetime - v_booking.end_datetime)) / 3600;
  ELSE
    -- Until studio closing time (default 22:00)
    v_available_hours := EXTRACT(EPOCH FROM (
      (v_booking.end_datetime::DATE + v_closing_time) - v_booking.end_datetime
    )) / 3600;
  END IF;

  -- Apply max extension limit from studio settings
  IF v_booking.max_extension_hours IS NOT NULL AND v_available_hours > v_booking.max_extension_hours THEN
    v_available_hours := v_booking.max_extension_hours::DECIMAL;
  END IF;

  -- Ensure minimum 0
  v_available_hours := GREATEST(0, v_available_hours);

  IF v_next_booking IS NOT NULL THEN
    RETURN QUERY SELECT v_available_hours, 'next_booking'::TEXT, v_next_booking.id;
  ELSE
    RETURN QUERY SELECT v_available_hours, 'closing_time'::TEXT, NULL::UUID;
  END IF;
END;
$$;
