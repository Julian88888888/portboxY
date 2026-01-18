# Устранение ошибки 500 для /api/custom-links

## Проблема: 500 Internal Server Error при POST /api/custom-links

### Основные причины:

#### 1. ❌ **RLS Policy Violation (Code 42501)** - Наиболее вероятно
**Ошибка:** `new row violates row-level security policy for table "custom_links"`

**Причина:** 
- Используется `REACT_APP_SUPABASE_ANON_KEY` вместо `SUPABASE_SERVICE_ROLE_KEY`
- Anon key подчиняется RLS политикам Supabase
- RLS блокирует вставку данных

**Решение:**
1. Зайдите в **Vercel Dashboard** → Ваш проект → **Settings** → **Environment Variables**
2. Добавьте переменную:
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: <ваш-service-role-key>
   ```
3. Получите Service Role Key из **Supabase Dashboard** → **Settings** → **API** → **service_role key**
4. **ВАЖНО:** Передеплойте проект после добавления переменной!
5. Убедитесь, что переменная добавлена для всех окружений (Production, Preview, Development)

#### 2. ❌ **Отсутствует переменная окружения**
**Ошибка:** `Supabase not configured`

**Решение:**
- Убедитесь, что установлены:
  - `REACT_APP_SUPABASE_URL` или `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (рекомендуется)
  - Или `REACT_APP_SUPABASE_ANON_KEY` (как fallback)

#### 3. ❌ **Неверный формат данных**
**Ошибка:** `Invalid JSON` или валидационные ошибки

**Решение:**
- Проверьте, что отправляется правильный JSON:
  ```json
  {
    "title": "Link Title",
    "url": "https://example.com",
    "icon_url": null,
    "enabled": true
  }
  ```

#### 4. ❌ **Проблемы с парсингом body**
**Ошибка:** Ошибки при парсинге JSON

**Решение:**
- Убедитесь, что заголовок `Content-Type: application/json` установлен
- Проверьте, что body является валидным JSON

### Проверка в Vercel:

1. **Проверьте логи функции:**
   - Vercel Dashboard → **Functions** → `/api/custom-links`
   - Ищите ошибки с кодом `42501` или упоминания RLS

2. **Проверьте Environment Variables:**
   - Vercel Dashboard → **Settings** → **Environment Variables**
   - Убедитесь, что `SUPABASE_SERVICE_ROLE_KEY` установлен

3. **Проверьте статус деплоя:**
   - Убедитесь, что последний деплой завершился успешно
   - Если переменная была добавлена после деплоя - передеплойте проект

### Тестирование:

Запустите тест для проверки:
```bash
node test-custom-links-api-auto.js
```

Или с токеном:
```bash
TEST_TOKEN=your_token node test-custom-links-api-auto.js
```

### Важно:

⚠️ **Service Role Key обходит RLS политики** - это безопасно для serverless функций, так как:
- Мы проверяем аутентификацию пользователя через `verifyToken()`
- Мы проверяем права доступа в коде (пользователь может создавать только свои ссылки)
- Service Role Key используется только на сервере, не отправляется клиенту

### Быстрая проверка:

```bash
# Проверьте, какая ошибка возвращается
curl -X POST https://portbox-y.vercel.app/api/custom-links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test","url":"https://example.com"}'
```

Если видите `code: "42501"` - проблема точно в отсутствии `SUPABASE_SERVICE_ROLE_KEY`.
