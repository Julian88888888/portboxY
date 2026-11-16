-- Unread tracking for booking chat (read cursors per reader)
-- Run in Supabase SQL Editor after booking_messages exists

CREATE TABLE IF NOT EXISTS booking_message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reader_type TEXT NOT NULL CHECK (reader_type IN ('model', 'client')),
  reader_key TEXT NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (booking_id, reader_type, reader_key)
);

CREATE INDEX IF NOT EXISTS idx_booking_message_reads_booking_id
  ON booking_message_reads(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_message_reads_reader
  ON booking_message_reads(reader_type, reader_key);

ALTER TABLE booking_message_reads ENABLE ROW LEVEL SECURITY;

-- Model can manage their own read cursors for bookings they own
DROP POLICY IF EXISTS "Model can view own booking reads" ON booking_message_reads;
CREATE POLICY "Model can view own booking reads"
  ON booking_message_reads FOR SELECT
  USING (
    reader_type = 'model'
    AND reader_key = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_message_reads.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Model can upsert own booking reads" ON booking_message_reads;
CREATE POLICY "Model can upsert own booking reads"
  ON booking_message_reads FOR INSERT
  WITH CHECK (
    reader_type = 'model'
    AND reader_key = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_message_reads.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Model can update own booking reads" ON booking_message_reads;
CREATE POLICY "Model can update own booking reads"
  ON booking_message_reads FOR UPDATE
  USING (
    reader_type = 'model'
    AND reader_key = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_message_reads.booking_id
      AND bookings.user_id = auth.uid()
    )
  );
