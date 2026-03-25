-- Public Bookings block on @username (title, hometown, description, toggles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bookings_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_bookings_title BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_hometown BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_booking_description BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.bookings_title IS 'Heading above bookings copy, e.g. BOOKINGS';
COMMENT ON COLUMN profiles.hometown IS 'e.g. Miami, USA';
COMMENT ON COLUMN profiles.booking_description IS 'Short paragraph under hometown';
