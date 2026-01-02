# Исправление: Supabase не настроен для albums API

## Проблема
В логах видно: `Supabase not configured, returning mock response`

Это значит, что альбомы создаются как mock данные и не сохраняются в базу.

## Решение

### 1. Исправлен controller
Теперь использует `REACT_APP_SUPABASE_ANON_KEY` как fallback, если `SUPABASE_SERVICE_ROLE_KEY` не установлен.

### 2. Добавлено логирование
В логах backend теперь видно, настроен ли Supabase.

## Что нужно сделать

### Вариант 1: Использовать Service Role Key (Рекомендуется)

Добавьте в `.env` файл в корне проекта:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Где взять:
1. Supabase Dashboard → Settings → API
2. Скопируйте **service_role** key (⚠️ секретный ключ!)

### Вариант 2: Использовать Anon Key (Текущий fallback)

Если `SUPABASE_SERVICE_ROLE_KEY` не установлен, будет использоваться `REACT_APP_SUPABASE_ANON_KEY`.

**Ограничение:** Anon key имеет ограниченные права, некоторые операции могут не работать.

## После настройки

1. **Перезапустите контейнеры:**
   ```bash
   docker-compose restart backend
   ```

2. **Проверьте логи:**
   ```bash
   docker-compose logs backend | grep -i "supabase"
   ```

   Должно быть:
   ```
   ✅ Supabase client initialized for albums API
   ```

3. **Создайте альбом снова:**
   - Альбом должен сохраниться в базу
   - Проверьте в Supabase: `SELECT * FROM albums;`

## Проверка

### Проверьте таблицы в Supabase:
```sql
SELECT * FROM albums ORDER BY created_at DESC;
SELECT * FROM images ORDER BY created_at DESC;
```

### Проверьте API:
```bash
curl http://localhost:5002/api/albums
```

Должен вернуть реальные альбомы из базы, а не mock данные.

## Важно

- **Service Role Key** имеет полные права доступа
- Не коммитьте его в git (уже в .gitignore)
- Для production используйте переменные окружения платформы

После настройки `SUPABASE_SERVICE_ROLE_KEY` альбомы будут правильно сохраняться в базу!



