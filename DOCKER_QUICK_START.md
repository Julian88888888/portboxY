# Быстрый старт Albums API в Docker

## Шаг 1: Создайте .env файл

В корне проекта создайте `.env`:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Шаг 2: Запустите контейнеры

```bash
# Остановите существующие (если есть)
docker-compose down

# Пересоберите backend (если нужно)
docker-compose build backend

# Запустите все сервисы
docker-compose up -d

# Следите за логами
docker-compose logs -f backend
```

## Шаг 3: Проверьте работоспособность

```bash
# Health check
curl http://localhost:5002/health

# Albums test endpoint
curl http://localhost:5002/api/albums/test
```

## Шаг 4: Создайте таблицы в Supabase

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL из `albums_schema_fixed.sql`
3. Проверьте таблицы:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('albums', 'images');
   ```

## Готово! 🎉

Теперь albums API должен работать. Откройте приложение и попробуйте создать альбом в Dashboard.

## Проблемы?

Смотрите `DOCKER_ALBUMS_FIX.md` для подробного troubleshooting.


