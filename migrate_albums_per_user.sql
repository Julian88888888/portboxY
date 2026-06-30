-- Per-user albums migration
-- Run in Supabase Dashboard → SQL Editor
-- Fixes: "column albums.user_id does not exist"

-- 1. Add user_id column
ALTER TABLE albums ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);

-- 2. RLS: public read, owners can write
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage albums" ON albums;
DROP POLICY IF EXISTS "Anyone can view albums" ON albums;
DROP POLICY IF EXISTS "Users can manage their own albums" ON albums;

CREATE POLICY "Anyone can view albums"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own albums"
  ON albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
  ON albums FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON albums FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Seed 2 starter albums for new signups
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

-- 4. Seed starter albums for existing users who have none
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    PERFORM seed_user_starter_albums(u.id);
  END LOOP;
END;
$$;

-- 5. Remove legacy shared albums (no owner) so they don't leak across accounts
DELETE FROM albums WHERE user_id IS NULL;
