# Исправление ошибки 500 при создании альбома

## Проблема
```
POST http://localhost:5002/api/albums
Status: 500 Internal Server Error
```

## Исправления

### 1. Исправлен middleware аутентификации

Middleware теперь использует `REACT_APP_SUPABASE_ANON_KEY` как fallback, если `SUPABASE_SERVICE_ROLE_KEY` не установлен.

**Файл**: `backend/middleware/supabaseAuth.js`

### 2. Улучшена обработка ошибок

Добавлено более подробное логирование ошибок в `createAlbum`.

## Проверка

### Шаг 1: Убедитесь, что переменные окружения установлены

Проверьте в `.env` файле:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Опционально, но рекомендуется
```

### Шаг 2: Перезапустите контейнеры

```bash
docker-compose restart backend
```

### Шаг 3: Проверьте логи

```bash
docker-compose logs backend --tail 50
```

### Шаг 4: Проверьте создание альбома

Если получаете ошибку "Invalid or expired token":
- Убедитесь, что вы авторизованы в приложении
- Токен должен быть валидным Supabase JWT токеном
- Проверьте, что токен передается в заголовке `Authorization: Bearer <token>`

## Возможные причины ошибки 500

1. **Supabase не настроен** - проверьте переменные окружения
2. **Таблицы не созданы** - выполните `albums_schema_fixed.sql` в Supabase
3. **Невалидный токен** - убедитесь, что пользователь авторизован
4. **RLS политики блокируют** - проверьте Row Level Security в Supabase

## Отладка

Добавьте логирование в браузере (DevTools → Network):
1. Откройте запрос к `/api/albums`
2. Проверьте Request Headers (должен быть Authorization)
3. Проверьте Response (текст ошибки)

Или проверьте логи backend:
```bash
docker-compose logs -f backend
```

Затем попробуйте создать альбом и посмотрите, какая ошибка появляется в логах.


