-- Видалити всі дублікати policies для profile-photos
-- Залишити тільки правильні policies з нормальними назвами

-- Видалити дублікати INSERT policies
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos yndkpx..." ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos yndkpx_0" ON storage.objects;

-- Видалити дублікати SELECT policies
DROP POLICY IF EXISTS "Allow public access to profile photos yndkpx_0" ON storage.objects;

-- Видалити дублікати DELETE policies
DROP POLICY IF EXISTS "Allow users to delete their own profile photos yndkpx_0" ON storage.objects;

-- Перевірка: після виконання має залишитися тільки 3 policies:
-- 1. "Allow authenticated users to upload profile photos" (INSERT)
-- 2. "Allow public access to profile photos" (SELECT)
-- 3. "Allow users to delete their own profile photos" (DELETE)




