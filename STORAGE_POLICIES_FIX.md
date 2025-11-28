# Як виправити помилку "row-level security policy" (403 Unauthorized)

Якщо ви отримуєте помилку `403 Unauthorized: new row violates row-level security policy` при завантаженні фото, це означає, що storage policies не налаштовані або налаштовані неправильно.

## Швидке виправлення через SQL Editor

Найпростіший спосіб - додати policies через SQL Editor:

1. Відкрийте https://app.supabase.com
2. Виберіть ваш проект
3. Перейдіть до **SQL Editor** (ліва панель)
4. Натисніть **"New query"**
5. Вставте весь цей SQL код і натисніть **"Run"**:

```sql
-- Policy 1: Дозволити завантаження фото (INSERT)
CREATE POLICY "Allow authenticated users to upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Дозволити публічний перегляд (SELECT)
CREATE POLICY "Allow public access to profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Policy 3: Дозволити видалення фото (DELETE)
CREATE POLICY "Allow users to delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

6. Перевірте, що всі 3 policies створилися успішно (не повинно бути помилок)
7. Спробуйте завантажити фото знову

## Альтернативний спосіб через UI (якщо SQL не працює)

### Policy 1: INSERT (завантаження)

1. **Storage** → **profile-photos** → **Policies** → **New Policy**
2. **Policy name:** `Allow authenticated users to upload profile photos`
3. **Allowed operation:** `INSERT`
4. **Target roles:** виберіть `authenticated`
5. **For full customization** → **WITH CHECK expression:**
   ```
   bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   ⚠️ Вставте ТІЛЬКИ цей текст, без дужок `WITH CHECK ()` - UI додасть їх автоматично!

### Policy 2: SELECT (перегляд)

1. **Storage** → **profile-photos** → **Policies** → **New Policy**
2. **Policy name:** `Allow public access to profile photos`
3. **Allowed operation:** `SELECT`
4. **Target roles:** виберіть `public`
5. **For full customization** → **USING expression:**
   ```
   bucket_id = 'profile-photos'
   ```
   ⚠️ Вставте ТІЛЬКИ цей текст, без дужок `USING ()` - UI додасть їх автоматично!

### Policy 3: DELETE (видалення)

1. **Storage** → **profile-photos** → **Policies** → **New Policy**
2. **Policy name:** `Allow users to delete their own profile photos`
3. **Allowed operation:** `DELETE`
4. **Target roles:** виберіть `authenticated`
5. **For full customization** → **USING expression:**
   ```
   bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   ⚠️ Вставте ТІЛЬКИ цей текст, без дужок `USING ()` - UI додасть їх автоматично!

## Перевірка policies

Після додавання policies:

1. Перейдіть до **Storage** → **profile-photos** → **Policies**
2. Ви повинні побачити 3 policies:
   - ✅ Allow authenticated users to upload profile photos (INSERT)
   - ✅ Allow public access to profile photos (SELECT)
   - ✅ Allow users to delete their own profile photos (DELETE)

## Якщо все ще не працює

1. **Перевірте, що bucket існує:**
   - Storage → має бути bucket з назвою `profile-photos`
   - Bucket має бути **Public**

2. **Перевірте, що ви залогінені:**
   - Спробуйте вийти і зайти знову
   - Перевірте, що сесія активна

3. **Перевірте policies:**
   - Всі 3 policies мають бути активними
   - Перевірте, що назви точно відповідають

4. **Очистіть кеш браузера:**
   - Натисніть Ctrl+Shift+R (або Cmd+Shift+R на Mac) для жорсткого перезавантаження

5. **Перевірте консоль браузера:**
   - Відкрийте DevTools (F12)
   - Перевірте, чи немає інших помилок

## Допомога

Якщо проблема залишається, перевірте:
- Чи правильно налаштовані змінні оточення `.env` (REACT_APP_SUPABASE_URL та REACT_APP_SUPABASE_ANON_KEY)
- Чи активний ваш Supabase проект
- Чи є у вас права на створення policies (якщо ви не власник проекту)




