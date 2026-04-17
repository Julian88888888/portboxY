-- Optional client @handle for display (booker’s profiles.username when logged in).
-- Run in Supabase SQL Editor (postgres role).

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_username TEXT;

COMMENT ON COLUMN bookings.client_username IS 'Booker public username from profiles; optional, for UI instead of raw email';
