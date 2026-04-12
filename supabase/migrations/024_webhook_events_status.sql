-- Migration 024 — add status tracking to processed_webhook_events
-- Prevents the "event marked processed but handler crashed" race: if the
-- handler throws after the idempotency insert, status stays 'processing' and
-- the next Stripe retry can re-run instead of being short-circuited as a dup.

ALTER TABLE public.processed_webhook_events
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'processing'
  CHECK (status IN ('processing', 'done', 'failed'));

ALTER TABLE public.processed_webhook_events
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Backfill existing rows — everything that landed before this migration was
-- considered successfully handled under the old "insert = done" contract.
UPDATE public.processed_webhook_events
  SET status = 'done', completed_at = processed_at
  WHERE status = 'processing' AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_status
  ON public.processed_webhook_events (status)
  WHERE status <> 'done';
