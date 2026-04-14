-- Migration 027 — services
--
-- Hosts can offer extra services on top of the studio rental (catering,
-- assistant, lighting setup, etc). Renters pick services at booking time;
-- the price gets added to the booking total via booking_services.

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,  -- nullable = host-wide service
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  pricing_unit TEXT NOT NULL DEFAULT 'flat'
    CHECK (pricing_unit IN ('flat', 'per_hour', 'per_session')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_host_id   ON public.services (host_id);
CREATE INDEX IF NOT EXISTS idx_services_studio_id ON public.services (studio_id) WHERE studio_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_active    ON public.services (is_active) WHERE is_active = true;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can SELECT active services (so renters see them when browsing)
CREATE POLICY "Anyone can read active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Hosts can manage their own services (incl. inactive)
CREATE POLICY "Hosts manage own services"
  ON public.services FOR ALL
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Service role full access (admin / cron)
CREATE POLICY "Service role full access services"
  ON public.services FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Booking ↔ Services join
CREATE TABLE IF NOT EXISTS public.booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_per_unit NUMERIC NOT NULL,    -- snapshot at booking time
  total_price    NUMERIC NOT NULL,    -- snapshot at booking time
  pricing_unit   TEXT    NOT NULL,    -- snapshot at booking time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON public.booking_services (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_service ON public.booking_services (service_id);

ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;

-- Renter sees the services attached to their own booking
CREATE POLICY "Renter sees own booking services"
  ON public.booking_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_services.booking_id AND b.renter_id = auth.uid()
  ));

-- Host sees the services attached to bookings on their studio
CREATE POLICY "Host sees own studio booking services"
  ON public.booking_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_services.booking_id AND b.host_id = auth.uid()
  ));

-- Service role full access (the /api/bookings POST inserts these via service client)
CREATE POLICY "Service role full access booking_services"
  ON public.booking_services FOR ALL TO service_role
  USING (true) WITH CHECK (true);
