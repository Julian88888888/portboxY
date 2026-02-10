-- Booking Chat - messages per booking
-- Run this in Supabase SQL Editor after bookings table exists

CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('model', 'client')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_created_at ON booking_messages(created_at ASC);

ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;

-- Only booking owner (model) can read/write messages for their bookings
DROP POLICY IF EXISTS "Model can view messages for own bookings" ON booking_messages;
CREATE POLICY "Model can view messages for own bookings"
  ON booking_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Model can insert messages for own bookings" ON booking_messages;
CREATE POLICY "Model can insert messages for own bookings"
  ON booking_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Model can update messages for own bookings" ON booking_messages;
CREATE POLICY "Model can update messages for own bookings"
  ON booking_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Model can delete messages for own bookings" ON booking_messages;
CREATE POLICY "Model can delete messages for own bookings"
  ON booking_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );
