-- Same schema drift as 007, now on bookings: subtotal and project_id from
-- 001_initial_schema.sql never made it into the deployed database.
-- subtotal: nullable here (001 has NOT NULL) — existing rows have no value;
-- the booking API always fills it for new rows.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL,
  ADD COLUMN IF NOT EXISTS project_id UUID;
