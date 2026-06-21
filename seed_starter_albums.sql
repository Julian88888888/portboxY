-- Per-user albums: add user_id and seed 2 starter albums for new accounts (was 4).
-- Run in Supabase SQL Editor after albums table exists.

ALTER TABLE albums ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);

CREATE OR REPLACE FUNCTION seed_user_starter_albums(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM albums WHERE user_id = p_user_id) = 0 THEN
    INSERT INTO albums (title, description, user_id) VALUES
      ('Fashion', 'High Fashion Portfolio Work', p_user_id),
      ('Portfolio', 'Add album description', p_user_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user_starter_albums()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM seed_user_starter_albums(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_starter_albums ON auth.users;
CREATE TRIGGER on_auth_user_created_starter_albums
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_starter_albums();

-- Optional: trim legacy 4 empty starter albums down to 2 (keeps 2 newest).
-- Only affects albums with no images.
WITH users_with_four_empty AS (
  SELECT a.user_id
  FROM albums a
  LEFT JOIN images i ON i.album_id = a.id
  WHERE a.user_id IS NOT NULL
  GROUP BY a.user_id
  HAVING COUNT(DISTINCT a.id) = 4 AND COUNT(i.id) = 0
),
ranked AS (
  SELECT a.id,
         ROW_NUMBER() OVER (PARTITION BY a.user_id ORDER BY a.created_at DESC) AS rn
  FROM albums a
  INNER JOIN users_with_four_empty u ON u.user_id = a.user_id
)
DELETE FROM albums
WHERE id IN (SELECT id FROM ranked WHERE rn > 2);
