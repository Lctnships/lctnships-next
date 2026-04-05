-- Composite indexes to speed up dashboard queries.
-- These match the WHERE + ORDER BY patterns used by:
--   src/app/[locale]/(dashboard)/dashboard/page.tsx
--   src/app/[locale]/(host)/host/dashboard/page.tsx
CREATE INDEX IF NOT EXISTS idx_bookings_renter_status_start
  ON public.bookings (renter_id, status, start_datetime);

CREATE INDEX IF NOT EXISTS idx_bookings_host_status_start
  ON public.bookings (host_id, status, start_datetime);

CREATE INDEX IF NOT EXISTS idx_bookings_host_status_payment
  ON public.bookings (host_id, status, payment_status);

CREATE INDEX IF NOT EXISTS idx_payouts_host_status
  ON public.payouts (host_id, status);

CREATE INDEX IF NOT EXISTS idx_projects_user_status_updated
  ON public.projects (user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type
  ON public.reviews (reviewer_id, review_type);
