-- Migration 026 — on-request booking flow
--
-- Split the single "everyone pays upfront" flow into two:
--   instant: studio.is_instant_book=true → existing path, status pending→confirmed on payment
--   on-request: status pending_approval → approved (w/ payment_deadline) → confirmed on payment,
--               or rejected / expired
--
-- Existing status values kept for backwards compatibility on old rows.

-- Drop the old status check constraint and replace with the expanded set.
DO $$
DECLARE
  c_name text;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'public.bookings'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (
    status IN (
      'pending',            -- legacy: instant-book pre-payment
      'pending_approval',   -- on-request: waiting for host to accept
      'approved',           -- on-request: host accepted, waiting for renter payment
      'rejected',           -- on-request: host rejected
      'expired',            -- on-request: renter didn't pay in time
      'confirmed',          -- paid
      'cancelled',
      'completed'
    )
  );

-- Same for payment_status — add 'none' for on-request before approval.
DO $$
DECLARE
  c_name text;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'public.bookings'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%payment_status%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_payment_status_check CHECK (
    payment_status IN (
      'none',              -- on-request pre-approval
      'pending',
      'awaiting_payment',  -- on-request approved, waiting for renter
      'paid',
      'refunded'
    )
  );

-- Approval metadata
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS approved_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by      UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_reason  TEXT,
  ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ, -- host-approved → renter must pay before this
  ADD COLUMN IF NOT EXISTS request_expires_at TIMESTAMPTZ; -- pending_approval auto-expires after 48h

CREATE INDEX IF NOT EXISTS idx_bookings_pending_approval_expiry
  ON public.bookings (request_expires_at)
  WHERE status = 'pending_approval';

CREATE INDEX IF NOT EXISTS idx_bookings_approved_payment_deadline
  ON public.bookings (payment_deadline)
  WHERE status = 'approved';

-- Extend the operational-column UPDATE grant so the approve/reject handlers
-- (which run via service client anyway) stay explicit. Financial columns
-- remain restricted to service_role (see migration 011).
GRANT UPDATE (approved_at, approved_by, rejected_at, rejected_reason, payment_deadline, request_expires_at)
  ON public.bookings TO authenticated;
