-- Legacy columns start_time/end_time/total_price (pre-001 schema, superseded
-- by start_datetime/end_datetime/total_amount) still carried NOT NULL and
-- blocked every insert. The app never writes them; make them nullable.
-- Not dropping them: table is empty now, but dropping is irreversible and
-- other drifted code paths may still read them.

ALTER TABLE public.bookings
  ALTER COLUMN start_time DROP NOT NULL,
  ALTER COLUMN end_time DROP NOT NULL,
  ALTER COLUMN total_price DROP NOT NULL;
