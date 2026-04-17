-- One-time: set client_username from profiles where booking email matches auth user.
-- Run after add_bookings_client_username.sql, in Supabase SQL Editor.

UPDATE bookings b
SET client_username = p.username
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(trim(b.email)) = lower(trim(u.email))
  AND p.username IS NOT NULL
  AND trim(p.username) <> ''
  AND (b.client_username IS NULL OR trim(b.client_username) = '');
