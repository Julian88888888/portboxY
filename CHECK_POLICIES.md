# Перевірка Storage Policies

## Як перевірити, чи всі policies створені:

1. Відкрийте https://app.supabase.com → ваш проект
2. Перейдіть до **Storage** (ліва панель)
3. Натисніть на bucket **"profile-photos"**
4. Перейдіть на вкладку **"Policies"**
5. Ви повинні побачити **3 активні policies**:

   ✅ **Allow authenticated users to upload profile photos** (INSERT)
   ✅ **Allow public access to profile photos** (SELECT)
   ✅ **Allow users to delete their own profile photos** (DELETE)

## Якщо всі 3 policies є, але завантаження все ще не працює:

### 1. Перевірте, що bucket публічний:
- Storage → profile-photos → Settings
- Переконайтеся, що "Public bucket" увімкнено

### 2. Перевірте аутентифікацію:
- Переконайтеся, що ви залогінені в додатку
- Спробуйте вийти і зайти знову
- Перевірте консоль браузера (F12) на наявність помилок JWT

### 3. Очистіть кеш:
- Натисніть Ctrl+Shift+R (або Cmd+Shift+R на Mac) для жорсткого перезавантаження
- Або закрийте і відкрийте браузер знову

### 4. Перевірте консоль браузера:
- Відкрийте DevTools (F12)
- Перейдіть на вкладку "Console"
- Спробуйте завантажити фото
- Подивіться, які помилки з'являються

## Якщо потрібно видалити і перестворити policies:

Якщо policies створені неправильно, можна їх видалити і створити заново:

```sql
-- Видалити всі policies для profile-photos
DROP POLICY IF EXISTS "Allow authenticated users to upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile photos" ON storage.objects;

-- Створити policies заново
CREATE POLICY "Allow authenticated users to upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow public access to profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow users to delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Перевірка через SQL:

Можна перевірити, які policies існують:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%profile photos%';
```

Це покаже всі policies, пов'язані з profile photos.




