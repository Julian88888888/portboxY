-- Expand profiles.job_type allowed values for new job types.
-- Run in Supabase SQL Editor.

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'profiles'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%job_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_job_type_check
  CHECK (
    job_type IS NULL OR job_type IN (
      'Model',
      'Photographer',
      'WardrobeStylist',
      'HairStylist',
      'MakeupArtist',
      'Videographer',
      'Director',
      'Producer',
      'CastingDirector',
      'EditorPublicist',
      'Manicurist',
      'Designer',
      'Artist',
      'Brand',
      'Agency'
    )
  );
