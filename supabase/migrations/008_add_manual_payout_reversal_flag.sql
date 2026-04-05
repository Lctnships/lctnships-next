-- Flag bookings where a refund was issued after the host payout went out.
-- These require manual payout reversal by an operator.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS requires_manual_payout_reversal boolean NOT NULL DEFAULT false;

-- Partial index so operators can quickly find rows needing action.
CREATE INDEX IF NOT EXISTS idx_bookings_manual_payout_reversal
  ON public.bookings (requires_manual_payout_reversal)
  WHERE requires_manual_payout_reversal = true;
