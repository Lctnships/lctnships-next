-- Deployed bookings RLS still referenced the legacy user_id column; the app
-- writes renter_id, so every insert hit "new row violates row-level security".
-- Replace the user_id-based policies with renter_id equivalents (host
-- policies were already correct).

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Renters can update own bookings" ON public.bookings;

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Renters can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = renter_id) WITH CHECK (auth.uid() = renter_id);
